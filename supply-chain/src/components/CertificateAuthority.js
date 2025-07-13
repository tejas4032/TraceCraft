import React, { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import { PinataSDK } from "pinata-web3";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Alert,
  Drawer,
  List,
  ListItem,
  ListItemText,
  CssBaseline,
  AppBar,
  Toolbar,
  IconButton,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Web3 from "web3";
import { contractABI, contractAddress } from "../config/contractConfig";
import { auth, db } from "../firebase"; // Firebase setup must be imported here
import { getDoc, doc } from "firebase/firestore";

const CertificateAuthority = () => {
  const [batchId, setBatchId] = useState("");
  const [batchDetails, setBatchDetails] = useState(null);
  const [certificateProvider, setCertificateProvider] = useState("");
  const [digitalSignature, setDigitalSignature] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [docHash, setDocHash] = useState("");
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("certifyBatch");

  const pinata = new PinataSDK({
    pinataJwt: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJjMWJjNTkwZS1mZTkzLTQ5NGItOGI3OC0wY2EyNGMyZDlkNWEiLCJlbWFpbCI6IjIwMjIuYXRoYXJ2YS5waGFkdGFyZUB2ZXMuYWMuaW4iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiZTNjZmIwMzNiZTYzN2M5OGJmOWMiLCJzY29wZWRLZXlTZWNyZXQiOiJiMGI1NGRjNDJjNzQ5Y2FjMzk4MjkwY2RiNzUyMGUzMTdjZTVmM2QwYTljNzc1NmIyNDZhZjk3ODQ5N2YwNTZmIiwiZXhwIjoxNzY2NjY5NTUzfQ.TMH-iRepirf7f1Ei3OlywU_0pob13gLZXnbd-W4ZCyo",
    pinataGateway: "your-gateway.mypinata.cloud",
  });

  const styles = {
    container: {
      paddingTop: "20px",
      backgroundColor: "#f5f7fa",
      color: "#333",
      fontFamily: "'Poppins', sans-serif",
    },
    header: {
      color: "#1976d2",
      fontWeight: "600",
    },
    button: {
      backgroundColor: "#1976d2",
      color: "white",
      '&:hover': {
        backgroundColor: "#1565c0",
      },
    },
    card: {
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      borderRadius: "10px",
    },
    alert: {
      marginTop: "20px",
    },
  };

  useEffect(() => {
    const initializeWeb3 = async () => {
      if (window.ethereum) {
        try {
          const web3Instance = new Web3(window.ethereum);
          setWeb3(web3Instance);
          await window.ethereum.request({ method: "eth_requestAccounts" });
          const accounts = await web3Instance.eth.getAccounts();
          setAccount(accounts[0]);
          const contractInstance = new web3Instance.eth.Contract(contractABI, contractAddress);
          setContract(contractInstance);
        } catch (error) {
          setStatusMessage("Error connecting to MetaMask");
        }
      } else {
        setStatusMessage("MetaMask is not installed.");
      }
    };
    initializeWeb3();
  }, []);

  const fetchBatchDetails = async () => {
    if (!batchId) {
      setStatusMessage("Please enter a valid batch ID");
      return;
    }
    setLoading(true);
    try {
      const batch = await contract.methods.getBatch(batchId).call();
      setBatchDetails(batch);
      setStatusMessage("Batch details fetched successfully");
    } catch (error) {
      setStatusMessage("Error fetching batch details");
    }
    setLoading(false);
  };

  const signCertificateDetails = async () => {
    try {
      const message = `Batch ID: ${batchId}\nCertificate Provider: ${certificateProvider}`;
      const privateKey = "0x05611eca3452c726054a6c0e1e1303bb475e6752dcc0889868ea1b97dbda1e5b"; // Replace with actual private key
      const signature = web3.eth.accounts.sign(message, privateKey);
      setDigitalSignature(signature.signature);
    } catch (error) {
      setStatusMessage("Error generating digital signature");
    }
  };

  const handleGeneratePDF = async () => {
    const doc = new jsPDF();
    doc.text(`Batch Details:`, 10, 10);
    doc.text(`Batch ID: ${batchDetails.id}`, 10, 20);
    doc.text(`Name: ${batchDetails.name}`, 10, 30);
    doc.text(`Quantity: ${batchDetails.quantity}`, 10, 40);
    doc.text(`Manufacturer: ${batchDetails.manufacturerName}`, 10, 50);
    doc.text(`Category: ${batchDetails.category}`, 10, 60);
    doc.text(`Manufacturer Details: ${batchDetails.manufacturerDetails}`, 10, 70);
    doc.text(`Certificate Authority: ${certificateProvider}`, 10, 80);
    doc.setFontSize(5);
    doc.text(`Digital Signature: ${digitalSignature}`, 10, 90);

    const pdfBlob = doc.output("blob");
    const file = new File([pdfBlob], "Certificate.pdf", { type: "application/pdf" });

    uploadToPinata(file);
  };

  const uploadToPinata = async (file) => {
    setLoading(true);
    try {
      const response = await pinata.upload.file(file);
      const uploadedDocHash = response.IpfsHash;
      setDocHash(uploadedDocHash);

      await contract.methods.certifyBatch(batchId, certificateProvider, digitalSignature, uploadedDocHash).send({ from: account });
      setStatusMessage("Batch certified successfully, document uploaded to IPFS");
    } catch (error) {
      setStatusMessage("Error uploading document to IPFS");
    }
    setLoading(false);
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <Drawer
        sx={{
          width: 240,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: 240,
            boxSizing: "border-box",
            boxShadow: "4px 0px 8px rgba(0, 0, 0, 0.2)",
          },
        }}
        variant={sidebarOpen ? "persistent" : "temporary"}
        anchor="left"
        open={sidebarOpen}
        onClose={toggleSidebar}
      >
        <Box sx={{ paddingTop: 5, textAlign: "center" }}>
          <Typography variant="h5" color="primary" gutterBottom>
            Certificate Authority Dashboard
          </Typography>
        </Box>
        <List>
          <ListItem
            button
            onClick={() => setActiveTab("certifyBatch")}
            sx={{
              backgroundColor: activeTab === "certifyBatch" ? "#1976d2" : "transparent",
              color: activeTab === "certifyBatch" ? "white" : "black",
              "&:hover": {
                backgroundColor: "blue",
                color: "white",
              },
            }}
          >
            <ListItemText primary="Certify Batch" />
          </ListItem>
        </List>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          backgroundColor: "#f4f6f8",
          padding: "0.5rem",
          height: "100vh",
          overflowY: "auto",
          transition: "margin-left 0.3s",
        }}
      >
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              sx={{
                marginRight: 2,
              }}
              onClick={toggleSidebar}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap>
              Certificate Authority Dashboard
            </Typography>
          </Toolbar>
        </AppBar>

        <Box sx={{ paddingTop: "64px", paddingBottom: "2rem" }}>
          {/* Main Content */}
          <Typography variant="h4" gutterBottom align="center">
            Certificate Authority
          </Typography>
          <Box display="flex" justifyContent="center" flexDirection="column" gap={2} sx={styles.container}>
            <TextField
              label="Enter Batch ID"
              variant="outlined"
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
              fullWidth
            />
            <Button
              variant="contained"
              color="primary"
              onClick={fetchBatchDetails}
              disabled={loading}
              fullWidth
              sx={styles.button}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Get Batch Details"}
            </Button>

            {statusMessage && (
              <Alert severity={statusMessage.includes("success") ? "success" : "error"} sx={styles.alert}>
                {statusMessage}
              </Alert>
            )}

            {batchDetails && (
              <Card sx={{ maxWidth: 700, margin: "0 auto", borderRadius: 2, boxShadow: 3 }}>
                <CardContent sx={styles.card}>
                  <Typography variant="h5" gutterBottom align="center" color="primary" sx={styles.header}>
                    Batch Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body1" color="textPrimary"><strong>Batch ID:</strong> {batchDetails.id}</Typography>
                      <Typography variant="body1" color="textPrimary"><strong>Name:</strong> {batchDetails.name}</Typography>
                      <Typography variant="body1" color="textPrimary"><strong>Quantity:</strong> {batchDetails.quantity}</Typography>
                      <Typography variant="body1" color="textPrimary"><strong>Manufacturer:</strong> {batchDetails.manufacturerName}</Typography>
                      <Typography variant="body1" color="textPrimary"><strong>Category:</strong> {batchDetails.category}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body1" color="textPrimary"><strong>Manufacturer Details:</strong> {batchDetails.manufacturerDetails}</Typography>
                    </Grid>
                  </Grid>

                  <TextField
                    label="Certificate Provider"
                    variant="outlined"
                    value={certificateProvider}
                    onChange={(e) => setCertificateProvider(e.target.value)}
                    fullWidth
                    margin="normal"
                  />
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={signCertificateDetails}
                    fullWidth
                    disabled={loading}
                    sx={styles.button}
                  >
                    Generate Digital Signature
                  </Button>

                  {digitalSignature && (
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Digital Signature: {digitalSignature}
                    </Typography>
                  )}

                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleGeneratePDF}
                    fullWidth
                    disabled={loading || !digitalSignature}
                    sx={styles.button}
                  >
                    Generate and Upload Certificate PDF
                  </Button>
                </CardContent>
              </Card>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default CertificateAuthority;