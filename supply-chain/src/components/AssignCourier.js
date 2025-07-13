import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  TextField,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { contractAddress, contractABI } from "../config/contractConfig"; // Adjust the import path as needed
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import Web3 from "web3";
import { Html5QrcodeScanner } from "html5-qrcode"; // Import the Html5QrcodeScanner

const AssignCourier = () => {
  const [productId, setProductId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const scannerRef = useRef(null);
  const [scannerInstance, setScannerInstance] = useState(null);
  const [account, setAccount] = useState("");
  const [walletAddress, setWalletAddress] = useState("");

  const web3 = new Web3(Web3.givenProvider || "http://localhost:8545");
  const contract = new web3.eth.Contract(contractABI, contractAddress);

  useEffect(() => {
    const loadAccount = async () => {
      const accounts = await web3.eth.requestAccounts();
      if (accounts.length > 0) {
        setAccount(accounts[0]);
      }

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

    loadAccount();
  }, []);

  const handleProductIdChange = (e) => {
    setProductId(e.target.value);
  };

  const handleAssignCourier = async () => {
    if (!productId) {
      setError(true);
      setMessage("Please enter a valid product ID.");
      setSnackbarOpen(true);
      return;
    }

    if (!walletAddress) {
      setError(true);
      setMessage("Wallet address not found.");
      setSnackbarOpen(true);
      return;
    }

    setLoading(true);

    try {
      await contract.methods
        .assignCourier(productId)
        .send({ from: walletAddress });

      setError(false);
      setMessage(`Product ${productId} has been assigned to you as the courier.`);
    } catch (err) {
      console.error(err);
      setError(true);
      setMessage("Error assigning product to courier. Please try again.");
    } finally {
      setLoading(false);
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const startScanner = () => {
    if (scannerInstance) {
      scannerInstance.clear();
      setScannerInstance(null);
    }

    if (!scannerRef.current) {
      return;
    }

    const newScannerInstance = new Html5QrcodeScanner(scannerRef.current, {
      fps: 10,
      qrbox: 250,
    });

    newScannerInstance.render(
      (decodedText) => {
        setProductId(decodedText);
        setIsScanning(false);
        newScannerInstance.clear();
        setScannerInstance(null);
      },
      (error) => {
        console.error("QR Code scan error:", error);
      }
    );

    setScannerInstance(newScannerInstance);
    setIsScanning(true);
  };

  const stopScanner = () => {
    if (scannerInstance) {
      scannerInstance.clear();
      setScannerInstance(null);
    }
    setIsScanning(false);
  };

  return (
    <Container maxWidth="sm" style={{ marginTop: "20px" }}>
      <Typography variant="h4" align="center" gutterBottom>
        Assign Product to Courier
      </Typography>

      <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
        <TextField
          label="Enter Product ID"
          variant="outlined"
          type="text"
          value={productId}
          onChange={handleProductIdChange}
          fullWidth
        />

        <Button
          variant="contained"
          color="primary"
          onClick={handleAssignCourier}
          fullWidth
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Assign as Courier"}
        </Button>

        <Button
          variant="outlined"
          color="secondary"
          onClick={isScanning ? stopScanner : startScanner}
          fullWidth
        >
          {isScanning ? "Stop Scanner" : "Scan QR Code"}
        </Button>
      </Box>

      {isScanning && (
        <div
          ref={scannerRef}
          style={{ marginTop: "20px", width: "100%", height: "auto" }}
        ></div>
      )}

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

export default AssignCourier;