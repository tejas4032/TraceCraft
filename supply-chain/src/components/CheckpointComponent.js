import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  TextField,
  CircularProgress,
  Snackbar,
  Alert,
  MenuItem,
} from "@mui/material";
import Web3 from "web3";
import { contractABI, contractAddress } from "../config/contractConfig"; // Ensure the correct path
import { useNavigate } from "react-router-dom"; // React Router for navigation
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

const CheckpointComponent = () => {
  const [checkpointDetails, setCheckpointDetails] = useState({
    productId: "",
    location: "",
    latitude: "", // Auto-populated latitude
    longitude: "", // Auto-populated longitude
    checkInTime: Date.now(), // Set default to current timestamp
    checkOutTime: Date.now(), // Set default to current timestamp
  });
  const [deliveryStatus, setDeliveryStatus] = useState("in-transit"); // Default delivery status
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const [web3, setWeb3] = useState(null);
  const [contractInstance, setContractInstance] = useState(null);
  const [account, setAccount] = useState(""); // Declare account state
  const [walletAddress, setWalletAddress] = useState(""); // Declare walletAddress state
  const navigate = useNavigate(); // Initialize react-router's navigate function

  // Automatically fetch latitude and longitude
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCheckpointDetails((prevDetails) => ({
            ...prevDetails,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
          }));
        },
        (error) => {
          setError(true);
          setMessage("Could not fetch device location. Please enable location services.");
          setSnackbarOpen(true);
        }
      );
    } else {
      setError(true);
      setMessage("Geolocation is not supported by this browser.");
      setSnackbarOpen(true);
    }
  }, []);

  // Handle changes in input fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCheckpointDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  // Handle changes in delivery status input field
  const handleDeliveryStatusChange = (e) => {
    setDeliveryStatus(e.target.value);
  };

  // Convert datetime string to UNIX timestamp (in seconds)
  const convertToUnixTimestamp = (datetime) => {
    return Math.floor(new Date(datetime).getTime() / 1000);
  };

  // Add a checkpoint
  const handleAddCheckpoint = async () => {
    if (!contractInstance || !walletAddress) {
      setError(true);
      setMessage("Contract or wallet address not available.");
      setSnackbarOpen(true);
      return;
    }

    if (
      !checkpointDetails.productId ||
      !checkpointDetails.location ||
      !checkpointDetails.latitude ||
      !checkpointDetails.longitude
    ) {
      setError(true);
      setMessage("Please provide all required fields.");
      setSnackbarOpen(true);
      return;
    }

    // Convert check-in and check-out time to UNIX timestamps
    const checkInTimestamp = convertToUnixTimestamp(checkpointDetails.checkInTime);
    const checkOutTimestamp = convertToUnixTimestamp(checkpointDetails.checkOutTime);

    setLoading(true);
    try {
      await contractInstance.methods
        .addCheckpoint(
          checkpointDetails.productId,
          checkpointDetails.location,
          checkpointDetails.latitude,
          checkpointDetails.longitude,
          checkInTimestamp,
          checkOutTimestamp
        )
        .send({ from: walletAddress });

      if (deliveryStatus === "delivered") {
        await contractInstance.methods
          .markAsDelivered(checkpointDetails.productId, deliveryStatus)
          .send({ from: walletAddress });
      }

      setError(false);
      setMessage("Checkpoint and delivery status updated successfully.");
      setCheckpointDetails({
        productId: "",
        location: "",
        latitude: "",
        longitude: "",
        checkInTime: Date.now(),
        checkOutTime: Date.now(),
      });
      setDeliveryStatus("in-transit"); // Reset to default
    } catch (err) {
      console.error("Error adding checkpoint or updating delivery status:", err);
      setError(true);
      setMessage("Error adding checkpoint or updating delivery status. Please try again.");
    } finally {
      setLoading(false);
      setSnackbarOpen(true);
    }
  };

  // Close Snackbar
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  // Initialize Web3 and Contract
  useEffect(() => {
    if (window.ethereum) {
      const initializeWeb3 = async () => {
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);

        const accounts = await web3Instance.eth.getAccounts();
        if (accounts.length > 0) {
          setAccount(accounts[0]); // Set the account after fetching
        }

        const contractInstance = new web3Instance.eth.Contract(
          contractABI,
          contractAddress
        );
        setContractInstance(contractInstance);

        // Fetch the user's wallet address from Firestore
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
      };

      initializeWeb3();
    } else {
      console.log("MetaMask is not installed");
      setError(true);
      setMessage("Please install MetaMask to proceed.");
      setSnackbarOpen(true);
    }
  }, []);

  // Navigate to the assign courier page
  const handleAssignCourier = () => {
    navigate("/assign-courier");
  };

  // Navigate to the all products page
  const handleViewAllProducts = () => {
    navigate("/all-products");
  };

  return (
    <Container maxWidth="md" sx={{ mt: 5 }}>
      <Box textAlign="center" mb={4}>
        <Typography variant="h4" gutterBottom>
          Welcome, Courier!
        </Typography>
        <Typography variant="body1" color="textSecondary">
          You are logged in as a Courier. Manage your assignments and view product details below.
        </Typography>
      </Box>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Card sx={{ textAlign: "center", boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Add Delivery Checkpoint
              </Typography>
              <TextField
                label="Product ID"
                variant="outlined"
                name="productId"
                value={checkpointDetails.productId}
                onChange={handleInputChange}
                fullWidth
                sx={{ mb: 2 }}
              />
              <TextField
                label="Location"
                variant="outlined"
                name="location"
                value={checkpointDetails.location}
                onChange={handleInputChange}
                fullWidth
                sx={{ mb: 2 }}
              />
              <TextField
                label="Latitude"
                variant="outlined"
                name="latitude"
                value={checkpointDetails.latitude}
                onChange={handleInputChange}
                fullWidth
                sx={{ mb: 2 }}
              />
              <TextField
                label="Longitude"
                variant="outlined"
                name="longitude"
                value={checkpointDetails.longitude}
                onChange={handleInputChange}
                fullWidth
                sx={{ mb: 2 }}
              />
              <TextField
                label="Check-in Time"
                variant="outlined"
                name="checkInTime"
                value={checkpointDetails.checkInTime}
                onChange={handleInputChange}
                fullWidth
                sx={{ mb: 2 }}
                type="datetime-local"
                InputLabelProps={{
                  shrink: true,
                }}
              />
              <TextField
                label="Check-out Time"
                variant="outlined"
                name="checkOutTime"
                value={checkpointDetails.checkOutTime}
                onChange={handleInputChange}
                fullWidth
                sx={{ mb: 2 }}
                type="datetime-local"
                InputLabelProps={{
                  shrink: true,
                }}
              />
              <TextField
                select
                label="Delivery Status"
                variant="outlined"
                name="deliveryStatus"
                value={deliveryStatus}
                onChange={handleDeliveryStatusChange}
                fullWidth
                sx={{ mb: 2 }}
              >
                <MenuItem value="in-transit">In-Transit</MenuItem>
                <MenuItem value="delivered">Delivered</MenuItem>
              </TextField>
              <Button
                variant="contained"
                color="primary"
                onClick={handleAddCheckpoint}
                fullWidth
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : "Add Checkpoint"}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={error ? "error" : "success"}
          sx={{ width: "100%" }}
        >
          {message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CheckpointComponent;