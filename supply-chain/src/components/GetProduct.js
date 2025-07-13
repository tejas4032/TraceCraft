import React, { useState, useEffect } from "react";
import Web3 from "web3";
import { contractAddress, contractABI } from "../config/contractConfig";
import { Container, TextField, Button, Typography, Box, Paper, Divider, Drawer, List, ListItem, ListItemText, CssBaseline, AppBar, Toolbar, IconButton, Card, CardContent, Grid } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icon issue in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
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
  paper: {
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  alert: {
    marginTop: "20px",
  },
  productDetails: {
    marginTop: "20px",
  },
  mapContainer: {
    height: "400px",
    marginTop: "20px",
  },
  card: {
    marginBottom: "20px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    borderRadius: "10px",
  },
};

const GetProduct = () => {
  const [productId, setProductId] = useState("");
  const [productDetails, setProductDetails] = useState(null);
  const [contract, setContract] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [walletAddress, setWalletAddress] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Initialize MetaMask and contract
  useEffect(() => {
    const initializeWeb3AndContract = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
          });
          setWalletAddress(accounts[0]);

          const web3Instance = new Web3(window.ethereum);
          setWeb3(web3Instance);

          const contractInstance = new web3Instance.eth.Contract(contractABI, contractAddress);
          setContract(contractInstance);
        } catch (error) {
          console.error("Error connecting to MetaMask or initializing contract:", error);
        }
      } else {
        console.error("MetaMask is not installed.");
      }
    };

    initializeWeb3AndContract();
  }, []);

  // Fetch product details
  const getProduct = async () => {
    if (!contract) {
      console.error("Contract instance is not available.");
      return;
    }

    try {
      const product = await contract.methods.getProduct(productId).call();
      setProductDetails(product);
      console.log("Product details retrieved:", product);
    } catch (error) {
      console.error("Error retrieving product:", error);
    }
  };

  // Add this utility function at the top of the file
  const convertUnixToDateTime = (timestamp) => {
    if (!timestamp) return "Not available";
    // Multiply by 1000 since contract stores in seconds but JS uses milliseconds
    return new Date(timestamp * 1000).toLocaleString();
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
        variant="persistent"
        anchor="left"
        open={sidebarOpen}
      >
        <Box sx={{ paddingTop: 5, textAlign: "center" }}>
          <Typography variant="h5" color="primary" gutterBottom>
            Product Dashboard
          </Typography>
        </Box>
        <List>
          <ListItem
            button
            sx={{
              backgroundColor: "#1976d2",
              color: "white",
              '&:hover': {
                backgroundColor: "#1565c0",
              },
            }}
          >
            <ListItemText primary="Get Product Details" />
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
              Customer Dashboard
            </Typography>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ mt: 4 }} style={styles.container}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }} style={styles.paper}>
            <Typography variant="h4" align="center" gutterBottom style={styles.header}>
              Get Product Details
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
              <Box sx={{ mt: 3, textAlign: "center" }}>
                <Button
                  variant="contained"
                  style={styles.button}
                  onClick={getProduct}
                  fullWidth
                  disabled={!walletAddress || !contract}
                >
                  Get Product
                </Button>
              </Box>
            </Box>
            {productDetails && (
              <Box sx={{ mt: 4 }} style={styles.productDetails}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Card sx={styles.card}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>Product Details:</Typography>
                        <Typography>ID: {productDetails.id}</Typography>
                        <Typography>Batch ID: {productDetails.batchId}</Typography>
                        <Typography>Manufacturer Address: {productDetails.manufacturer}</Typography>
                        <Typography>Logistics Partner Address: {productDetails.logisticsPartner}</Typography>
                        <Typography>Customer Address: {productDetails.customer}</Typography>
                        <Typography>Customer Name: {productDetails.customerName}</Typography>
                        <Typography>Customer Address: {productDetails.customerAddress}</Typography>
                        <Typography>Customer Phone Number: {productDetails.customerPhoneNumber}</Typography>
                        <Typography>Customer Email: {productDetails.customerEmail}</Typography>
                        <Typography>Delivery Status: {productDetails.deliveryStatus}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Card sx={styles.card}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>Batch Details:</Typography>
                        {productDetails.batchDetails ? (
                          <>
                            <Typography>ID: {productDetails.batchDetails.id}</Typography>
                            <Typography>Name: {productDetails.batchDetails.name}</Typography>
                            <Typography>Price: {productDetails.batchDetails.price} INR</Typography>
                            <Typography>Manufacturer Name: {productDetails.batchDetails.manufacturerName}</Typography>
                            <Typography>Manufacturer Details: {productDetails.batchDetails.manufacturerDetails}</Typography>
                            <Typography>
                              Longitude: {productDetails.batchDetails.longitude || "Not available"}
                            </Typography>
                            <Typography>
                              Latitude: {productDetails.batchDetails.latitude || "Not available"}
                            </Typography>
                            <Typography>Category: {productDetails.batchDetails.category}</Typography>
                            <Typography>Manufacturer Address: {productDetails.batchDetails.manufacturer}</Typography>
                            <Typography>Certificate Authority: {productDetails.batchDetails.certificateAuthority}</Typography>
                            <Typography>Certificate Document Hash: {productDetails.batchDetails.certificateDocHash}</Typography>
                          </>
                        ) : (
                          <Typography>No batch details available.</Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Card sx={styles.card}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>Checkpoints:</Typography>
                        {productDetails.checkpoints && productDetails.checkpoints.length > 0 ? (
                          productDetails.checkpoints.map((checkpoint, index) => (
                            <Box key={index} sx={{ mt: 1 }}>
                              <Typography>Checkpoint {index + 1}:</Typography>
                              <Typography>Date: {checkpoint.date}</Typography>
                              <Typography>Location: {checkpoint.location}</Typography>
                              <Typography>Latitude: {checkpoint.longitude}</Typography>
                              <Typography>Longitude: {checkpoint.latitude}</Typography>
                              <Typography>
                                Check-in Time: {convertUnixToDateTime(checkpoint.checkInTime)}
                              </Typography>
                              <Typography>
                                Check-out Time: {convertUnixToDateTime(checkpoint.checkOutTime)}
                              </Typography>
                            </Box>
                          ))
                        ) : (
                          <Typography>No checkpoints available.</Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Card sx={styles.card}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>Map:</Typography>
                        {productDetails.batchDetails.latitude && productDetails.batchDetails.longitude && (
                          <MapContainer
                            center={[productDetails.batchDetails.latitude, productDetails.batchDetails.longitude]}
                            zoom={10}
                            style={styles.mapContainer}
                          >
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            {/* Manufacturer marker */}
                            <Marker
                              position={[
                                productDetails.batchDetails.latitude,
                                productDetails.batchDetails.longitude,
                              ]}
                              icon={L.divIcon({
                                className: "custom-icon",
                                html: `<div style="background-color:blue; color:white; border-radius:50%; width:24px; height:24px; display:flex; justify-content:center; align-items:center;">0</div>`,
                              })}
                            >
                              <Popup>Manufacturer Location</Popup>
                            </Marker>

                            {/* Checkpoints markers */}
                            {productDetails.checkpoints &&
                              productDetails.checkpoints.map((checkpoint, index) => (
                                <Marker
                                  key={index}
                                  position={[checkpoint.longitude, checkpoint.latitude]}
                                  icon={L.divIcon({
                                    className: "custom-icon",
                                    html: `<div style="background-color:red; color:white; border-radius:50%; width:24px; height:24px; display:flex; justify-content:center; align-items:center;">${index + 1}</div>`,
                                  })}
                                >
                                  <Popup>
                                    Checkpoint {index + 1}:<br />
                                    Check-in: {convertUnixToDateTime(checkpoint.checkInTime)}<br />
                                    Check-out: {convertUnixToDateTime(checkpoint.checkOutTime)}
                                  </Popup>
                                </Marker>
                              ))}
                          </MapContainer>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Paper>
        </Container>
      </Box>
    </Box>
  );
};

export default GetProduct;