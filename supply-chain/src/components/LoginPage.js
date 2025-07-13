import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, setDoc, collection, addDoc, getDocs } from "firebase/firestore";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Grid,
  CssBaseline,
  Paper,
} from "@mui/material";
import "./LoginPage.css";

const LoginPage = ({ setIsAuthenticated, setStep }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [walletAddresses, setWalletAddresses] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Connect to MetaMask
  const connectToMetaMask = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        if (accounts && accounts.length > 0) {
          setWalletAddresses(accounts);
          setError(""); // Clear any previous errors
        } else {
          setError("No wallet accounts found. Please try again.");
        }
      } catch (err) {
        console.error("MetaMask connection error:", err);
        setError("MetaMask connection failed. Please try again.");
      }
    } else {
      setError("MetaMask is not installed. Please install it to proceed.");
    }
  };

  // Get the next available wallet address
  const getNextAvailableWalletAddress = async () => {
    try {
      const usedWalletsSnapshot = await getDocs(collection(db, "usedWallets"));
      const usedWallets = usedWalletsSnapshot.docs.map((doc) => doc.data().walletAddress);

      return walletAddresses.find((address) => !usedWallets.includes(address));
    } catch (err) {
      console.error("Error fetching used wallet addresses:", err);
      setError("Failed to fetch available wallet addresses. Please try again.");
      return null;
    }
  };

  // Mark wallet address as used
  const markWalletAsUsed = async (walletAddress) => {
    try {
      await addDoc(collection(db, "usedWallets"), { walletAddress });
    } catch (err) {
      console.error("Error marking wallet as used:", err);
      setError("Failed to update wallet usage. Please try again.");
    }
  };

  // Merge user data in Firestore
  const mergeUserData = async (uid, email, walletAddress) => {
    try {
      const userDocRef = doc(db, "users", uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const existingData = userDoc.data();
        if (!existingData.walletAddress) {
          await updateDoc(userDocRef, { walletAddress });
          await markWalletAsUsed(walletAddress);
        }
      } else {
        await setDoc(userDocRef, {
          email,
          walletAddress,
          role: "Unknown",
        });
        await markWalletAsUsed(walletAddress);
      }
    } catch (err) {
      console.error("Error merging user data:", err);
      setError("Failed to update user data. Please try again.");
    }
  };

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Step 1: Connect to MetaMask
    if (walletAddresses.length === 0) {
      await connectToMetaMask();
      if (walletAddresses.length === 0) {
        setError("MetaMask connection is required to proceed.");
        setLoading(false);
        return;
      }
    }

    // Step 2: Perform Firebase authentication
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, "users", user.uid));
      let walletAddress = userDoc.exists() ? userDoc.data().walletAddress : null;

      if (!walletAddress) {
        walletAddress = await getNextAvailableWalletAddress();
        if (!walletAddress) {
          setError("No available wallet addresses. Please contact support.");
          setLoading(false);
          return;
        }
        await mergeUserData(user.uid, user.email, walletAddress);
      }

      if (userDoc.exists()) {
        const userData = userDoc.data();

        if (!userData.role || !["Manufacturer", "Courier", "Certification Authority", "Customer"].includes(userData.role)) {
          setError("Invalid or missing role. Please contact support.");
          setLoading(false);
          return;
        }

        setIsAuthenticated(true);
        switch (userData.role) {
          case "Manufacturer":
            navigate("/manufacturer-dashboard");
            break;
          case "Courier":
            navigate("/courier-dashboard");
            break;
          case "Certification Authority":
            navigate("/certificate-authority");
            break;
          case "Customer":
            navigate("/get-Product");
            break;
          default:
            setError("Invalid role. Please contact support.");
        }
      } else {
        setError("User data not found. Please contact support.");
      }
    } catch (err) {
      console.error("Error during login:", err);
      setError("Invalid credentials. Redirecting to signup...");
      setTimeout(() => navigate("/signup"), 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" className="container">
      <CssBaseline />
      <div className="card">
        <Box className="card-header">
          <Typography variant="h5" className="title">
            Log In to Your Account
          </Typography>
          <Typography variant="body1" className="subtitle">
            Please enter your details to log in.
          </Typography>
        </Box>
        <Box
          component="form"
          onSubmit={handleLogin}
          className="form-container"
        >
          <TextField
            label="Email"
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            required
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            required
          />
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            className="login-button"
          >
            {loading ? "Logging In..." : "Log In"}
          </Button>
        </Box>
        {error && (
          <Alert severity="error" className="error-alert">
            {error}
          </Alert>
        )}
        <Grid container justifyContent="center" className="signup-link">
          <Grid item>
            <Typography variant="body2" className="signup-text">
              Don't have an account?{" "}
              <Button className="signup-button" onClick={() => navigate("/signup")}>
                Sign Up
              </Button>
            </Typography>
          </Grid>
        </Grid>
      </div>
    </Container>
  );
};

export default LoginPage;
