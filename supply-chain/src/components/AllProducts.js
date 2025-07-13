import React, { useState, useEffect } from "react";
import Web3 from "web3";
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Button,
  Collapse,
  Box,
} from "@mui/material";
import { contractAddress, contractABI } from "../config/contractConfig";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";


const AllProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null); // To track expanded rows
  const [walletAddress, setWalletAddress] = useState("");

  const web3 = new Web3(Web3.givenProvider || "http://localhost:8545");
  const contract = new web3.eth.Contract(contractABI, contractAddress);


  // Get user's wallet address
  useEffect(() => {
    const getWalletAddress = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setWalletAddress(userDoc.data().walletAddress);
          }
        }
      } catch (error) {
        console.error("Error fetching wallet address:", error);
        setError("Failed to fetch wallet address");
      }
    };
    getWalletAddress();
  }, []);

  const getAllProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const productIds = await contract.methods.getAllProductIds().call();
      const productsList = [];

      for (const id of productIds) {
        const productDetails = await contract.methods.getProduct(id).call();
         // Filter products based on wallet address
         if (
          productDetails.manufacturer.toLowerCase() === walletAddress.toLowerCase() ||
          productDetails.logisticsPartner.toLowerCase() === walletAddress.toLowerCase()
        ) {
        const checkpointCount = productDetails.checkpoints.length; // Count checkpoints

        productsList.push({
          id: productDetails.id,
          batchName: productDetails.batchDetails.name, // Access the batch name
          batchPrice: productDetails.batchDetails.price,
          manufacturerName: productDetails.batchDetails.manufacturerName,
          manufacturerDetails: productDetails.batchDetails.manufacturerDetails,
          longitude: productDetails.batchDetails.longitude,
          latitude: productDetails.batchDetails.latitude,
          category: productDetails.batchDetails.category,
          certificateAuthority: productDetails.batchDetails.certificateAuthority,
          digitalSignature: productDetails.batchDetails.digitalSignature,
          certificateHash: productDetails.batchDetails.certificateDocHash,
          isCertified: productDetails.batchDetails.isCertified,
          courier: productDetails.logisticsPartner,
          status: productDetails.deliveryStatus,
          checkpoints: productDetails.checkpoints,
          checkpointCount, // Add checkpoint count
        });
      }
    }
      setProducts(productsList);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Failed to fetch products. Please try again later.");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (walletAddress) {
      getAllProducts();
    }
  }, [walletAddress]);

  const toggleRow = (rowIndex) => {
    setExpandedRow(expandedRow === rowIndex ? null : rowIndex);
  };

  return (
    <Container maxWidth="lg" style={{ marginTop: "20px" }}>
      <Typography variant="h4" align="center" gutterBottom>
        All Products
      </Typography>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
          <CircularProgress />
        </div>
      ) : error ? (
        <Alert severity="error" style={{ marginTop: "20px" }}>
          {error}
        </Alert>
      ) : products.length === 0 ? (
        <Typography variant="h6" align="center" style={{ marginTop: "20px" }}>
          No products found.
        </Typography>
      ) : (
        <TableContainer component={Paper} style={{ marginTop: "20px" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Product ID</strong></TableCell>
                <TableCell><strong>Batch Name</strong></TableCell>
                <TableCell><strong>Batch Price</strong></TableCell>
                <TableCell><strong>Manufacturer Name</strong></TableCell>
                <TableCell><strong>Manufacturer Details</strong></TableCell>
                <TableCell><strong>Longitude</strong></TableCell>
                <TableCell><strong>Latitude</strong></TableCell>
                <TableCell><strong>Category</strong></TableCell>
                <TableCell><strong>Courier Address</strong></TableCell>
                <TableCell><strong>Delivery Status</strong></TableCell>
                <TableCell><strong>Checkpoints Count</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product, index) => (
                <React.Fragment key={index}>
                  <TableRow>
                    <TableCell>{product.id}</TableCell>
                    <TableCell>{product.batchName}</TableCell>
                    <TableCell>{product.batchPrice}</TableCell>
                    <TableCell>{product.manufacturerName}</TableCell>
                    <TableCell>{product.manufacturerDetails}</TableCell>
                    <TableCell>{product.longitude}</TableCell>
                    <TableCell>{product.latitude}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>
                      {product.courier !== "0x0000000000000000000000000000000000000000"
                        ? product.courier
                        : "No courier assigned"}
                    </TableCell>
                    <TableCell>{product.status || "No status available"}</TableCell>
                    <TableCell>{product.checkpointCount}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => toggleRow(index)}
                      >
                        {expandedRow === index ? "Hide Checkpoints" : "Show Checkpoints"}
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={12}>
                      <Collapse in={expandedRow === index}>
                        <Box margin={2}>
                          <Typography variant="h6">Checkpoints</Typography>
                          {product.checkpoints.length > 0 ? (
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>Location</TableCell>
                                  <TableCell>Check-In Time</TableCell>
                                  <TableCell>Check-Out Time</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {product.checkpoints.map((checkpoint, i) => (
                                  <TableRow key={i}>
                                    <TableCell>{checkpoint.location}</TableCell>
                                    <TableCell>{new Date(checkpoint.checkInTime * 1000).toLocaleString()}</TableCell>
                                    <TableCell>{new Date(checkpoint.checkOutTime * 1000).toLocaleString()}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          ) : (
                            <Typography>No checkpoints available</Typography>
                          )}
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={12} align="center">
                      {product.certificateHash ? (
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={() => window.open(`https://gateway.pinata.cloud/ipfs/${product.certificateHash}`, "_blank")}
                        >
                          View Certificate
                        </Button>
                      ) : (
                        "No certificate available"
                      )}
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default AllProducts;
