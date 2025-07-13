import React, { useState, useEffect } from "react";
import Web3 from "web3";
import { Container, TextField, Button, Typography, Box, Paper, Divider } from "@mui/material";
import { contractAddress, contractABI } from "../config/contractConfig";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

const AddBatch = () => {
  const [batchId, setBatchId] = useState("");
  const [batchName, setBatchName] = useState("");
  const [price, setPrice] = useState("");
  const [manufacturerName, setManufacturerName] = useState("");
  const [manufacturerDetails, setManufacturerDetails] = useState("");
  const [longitude, setLongitude] = useState("");
  const [latitude, setLatitude] = useState("");
  const [category, setCategory] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [walletAddress, setWalletAddress] = useState("");
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // Auto-connect MetaMask
  useEffect(() => {
    const autoConnectMetaMask = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
          });
          setIsConnected(true);

          const web3Instance = new Web3(window.ethereum);
          setWeb3(web3Instance);

          const contractInstance = new web3Instance.eth.Contract(contractABI, contractAddress);
          setContract(contractInstance);

          const user = auth.currentUser;
          if (user) {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
              setWalletAddress(userDoc.data().walletAddress);
            } else {
              console.error("User document not found in Firestore.");
            }
          } else {
            console.error("No authenticated user found.");
          }
        } catch (err) {
          console.error("MetaMask connection failed:", err);
        }
      } else {
        console.log("MetaMask is not installed.");
      }
    };

    autoConnectMetaMask();

    // Fetch geolocation automatically on component mount
    const fetchLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLatitude(position.coords.latitude.toString());
            setLongitude(position.coords.longitude.toString());
          },
          (error) => {
            console.error("Error fetching location: ", error);
            alert("Failed to fetch location.");
          }
        );
      } else {
        alert("Geolocation is not supported by this browser.");
      }
    };

    fetchLocation();
  }, []);

  // Add batch
  const addBatch = async () => {
    if (!web3 || !contract || !walletAddress) {
      console.error("Web3, contract, or walletAddress is not available.");
      return;
    }

    if (
      !batchId ||
      !batchName ||
      !price ||
      !manufacturerName ||
      !manufacturerDetails ||
      !longitude ||
      !latitude ||
      !category
    ) {
      alert("Please fill all fields.");
      return;
    }

    try {
      setIsLoading(true);
      // Call the smart contract function to add the batch
      await contract.methods
        .addBatch(
          batchId,
          batchName,
          price,
          manufacturerName,
          manufacturerDetails,
          longitude,
          latitude,
          category
        )
        .send({ from: walletAddress });

      console.log("Batch added successfully");
      alert("Batch added successfully!");
    } catch (error) {
      console.error("Error adding batch:", error);
      alert("Error adding batch.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Add a New Batch
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Box component="form" noValidate autoComplete="off">
          <TextField
            label="Batch ID"
            type="number"
            fullWidth
            value={batchId}
            onChange={(e) => setBatchId(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Batch Name"
            fullWidth
            value={batchName}
            onChange={(e) => setBatchName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Price (INR)"
            type="number"
            fullWidth
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Manufacturer Name"
            fullWidth
            value={manufacturerName}
            onChange={(e) => setManufacturerName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Manufacturer Details"
            fullWidth
            multiline
            rows={3}
            value={manufacturerDetails}
            onChange={(e) => setManufacturerDetails(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Longitude"
            fullWidth
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Latitude"
            fullWidth
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Category"
            fullWidth
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={addBatch}
              fullWidth
              disabled={isLoading || !isConnected}
            >
              {isLoading ? "Adding Batch..." : "Add Batch"}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default AddBatch;
