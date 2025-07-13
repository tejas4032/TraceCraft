import React, { useState, useEffect } from "react";
import Web3 from "web3";
import { Container, TextField, Button, Typography, Box, Paper, Divider, Snackbar, Alert } from "@mui/material";
import { contractAddress, contractABI } from "../config/contractConfig";
import axios from "axios";
import { auth, db } from "../firebase"; // Import Firebase Auth and Firestore
import { doc, getDoc } from "firebase/firestore"; // Import Firestore functions
import { QRCodeCanvas } from "qrcode.react"; // Import QRCodeCanvas
import html2canvas from "html2canvas"; // Import html2canvas

const AddProduct = () => {
  const [productId, setProductId] = useState(1);
  const [batchId, setBatchId] = useState(1);

  // Customer Fields
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerPhoneNumber, setCustomerPhoneNumber] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  // MetaMask connection
  const [walletAddress, setWalletAddress] = useState("");
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // Snackbar state
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // QR Code state
  const [qrCodeValue, setQrCodeValue] = useState("");

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

          const contractInstance = new web3Instance.eth.Contract(
            contractABI,
            contractAddress
          );
          setContract(contractInstance);

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
        } catch (err) {
          console.error("MetaMask connection failed:", err);
        }
      } else {
        console.log("MetaMask is not installed.");
      }
    };

    autoConnectMetaMask();
  }, []);

  // Send email using Brevo (Sendinblue) API
  const sendEmail = async () => {
    const apiKey = ""; // Replace with your Brevo API key

    const emailData = {
      sender: { email: "codeofduty24@gmail.com" },
      to: [{ email: customerEmail }],
      subject: `Product Details - Product ID: ${productId}`,
      htmlContent: `
        <h3>Product Details</h3>
        <p><strong>Product ID:</strong> ${productId}</p>
        <p><strong>Batch ID:</strong> ${batchId}</p>
        <p><strong>Customer Name:</strong> ${customerName}</p>
        <p><strong>Customer Address:</strong> ${customerAddress}</p>
        <p><strong>Customer Phone Number:</strong> ${customerPhoneNumber}</p>
        <p><strong>Customer Email:</strong> ${customerEmail}</p>
      `,
    };

    try {
      const response = await axios.post(
        "https://api.brevo.com/v3/smtp/email",
        emailData,
        {
          headers: {
            "api-key": apiKey,
            "Content-Type": "application/json",
          }
        }
      );
      console.log("Email sent successfully:", response.data);
    } catch (error) {
      console.error("Error sending email:", error);
    }
  };

  // Add product and send email
  const addProduct = async () => {
    if (!web3 || !contract || !walletAddress) {
      console.error("Web3, contract, or walletAddress is not available.");
      return;
    }

    try {
      // Call the smart contract function to add the product with all fields
      const result = await contract.methods
        .addProduct(
          productId,
          batchId,
          customerName,
          customerAddress,
          customerPhoneNumber,
          customerEmail
        )
        .send({ from: walletAddress });

      const newProductId = result.events.ProductAdded.returnValues.productId;
      setProductId(newProductId);
      setQrCodeValue(newProductId); // Set the QR code value to the new product ID

      console.log("Product added successfully");

      // Send email to the customer with product details
      await sendEmail();
      console.log("Email sent to customer successfully");

      setError(false);
      setMessage("Product added and email sent successfully.");
    } catch (error) {
      console.error("Error adding product or sending email:", error);
      setError(true);
      setMessage("Error adding product or sending email. Please try again.");
    } finally {
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handlePrint = () => {
    const qrCodeElement = document.getElementById("qrCode");
    html2canvas(qrCodeElement).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const printWindow = window.open("", "_blank");
      printWindow.document.write(`<html><head><title>Print QR Code</title></head><body>`);
      printWindow.document.write(`<div style="text-align: center;">`);
      printWindow.document.write(`<h1>Product ID: ${productId}</h1>`);
      printWindow.document.write(`<img src="${imgData}" />`);
      printWindow.document.write(`</div></body></html>`);
      printWindow.document.close();
      printWindow.print();
    });
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Add a Product
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Box component="form" noValidate autoComplete="off">
          <TextField
            label="Product ID"
            type="number"
            fullWidth
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Batch ID"
            type="number"
            fullWidth
            value={batchId}
            onChange={(e) => setBatchId(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Customer Name"
            fullWidth
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Customer Address"
            fullWidth
            value={customerAddress}
            onChange={(e) => setCustomerAddress(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Customer Phone Number"
            type="tel"
            fullWidth
            value={customerPhoneNumber}
            onChange={(e) => setCustomerPhoneNumber(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Customer Email"
            type="email"
            fullWidth
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={addProduct}
              fullWidth
              disabled={!isConnected}
            >
              Add Product
            </Button>
          </Box>
          {qrCodeValue && (
            <Box mt={4} textAlign="center">
              <Typography variant="h6">QR Code for Product ID: {productId}</Typography>
              <div id="qrCode">
                <QRCodeCanvas value={qrCodeValue} size={256} />
              </div>
              <Button
                variant="contained"
                color="secondary"
                onClick={handlePrint}
                style={{ marginTop: "20px" }}
              >
                Print QR Code
              </Button>
            </Box>
          )}
        </Box>
      </Paper>
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

export default AddProduct;