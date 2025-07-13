import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  TextField,
  CircularProgress,
  Snackbar,
  Alert,
  MenuItem,
  CssBaseline,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Web3 from "web3";
import { contractABI, contractAddress } from "../config/contractConfig"; // Ensure the correct path
import { useNavigate } from "react-router-dom"; // React Router for navigation
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

// Components for dynamic right-hand side content
import AssignCourier from './AssignCourier'; // Assume you have this component
import AllProducts from './AllProducts'; // Assume you have this component
import AddCheckpoints from './CheckpointComponent'; // Assume you have this component

const CourierDashboard = () => {
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

  const [activeButton, setActiveButton] = useState('assignCourier'); // Default active button
  const [rightContent, setRightContent] = useState(<AssignCourier />); // Default right-hand content

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

      await contractInstance.methods
        .markAsDelivered(checkpointDetails.productId, deliveryStatus)
        .send({ from: walletAddress });

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

  // Handle sidebar button click
  const handleSidebarClick = (action) => {
    setActiveButton(action);

    if (action === 'assignCourier') {
      setRightContent(<AssignCourier />);
    } else if (action === 'allProducts') {
      setRightContent(<AllProducts />);
    } else if (action === 'addCheckpoints') {
      setRightContent(<AddCheckpoints />);
    }
  };

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
        open={true}
      >
        <Box sx={{ paddingTop: 5, textAlign: "center" }}>
          <Typography variant="h5" color="primary" gutterBottom>
            Courier Dashboard
          </Typography>
        </Box>
        <List>
          <ListItem
            button
            onClick={() => handleSidebarClick('assignCourier')}
            sx={{
              backgroundColor: activeButton === 'assignCourier' ? '#1976d2' : 'transparent',
              color: activeButton === 'assignCourier' ? 'white' : 'inherit',
              '&:hover': {
                backgroundColor: '#1976d2',
              },
            }}
          >
            <ListItemText primary="Assign Courier" />
          </ListItem>
          <ListItem
            button
            onClick={() => handleSidebarClick('allProducts')}
            sx={{
              backgroundColor: activeButton === 'allProducts' ? '#1976d2' : 'transparent',
              color: activeButton === 'allProducts' ? 'white' : 'inherit',
              '&:hover': {
                backgroundColor: '#1976d2',
              },
            }}
          >
            <ListItemText primary="View All Products" />
          </ListItem>
          <ListItem
            button
            onClick={() => handleSidebarClick('addCheckpoints')}
            sx={{
              backgroundColor: activeButton === 'addCheckpoints' ? '#1976d2' : 'transparent',
              color: activeButton === 'addCheckpoints' ? 'white' : 'inherit',
              '&:hover': {
                backgroundColor: '#1976d2',
              },
            }}
          >
            <ListItemText primary="Add Checkpoints" />
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
              onClick={() => {}}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap>
              Courier Dashboard
            </Typography>
          </Toolbar>
        </AppBar>

        <Box sx={{ paddingTop: "64px", paddingBottom: "2rem" }}>
          {rightContent}
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
        </Box>
      </Box>
    </Box>
  );
};

export default CourierDashboard;