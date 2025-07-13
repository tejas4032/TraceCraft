import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";
import {
  Container,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Alert,
  Box,
  Grid,
  CssBaseline,
} from "@mui/material";
import "./SignupPage.css";

const SignupPage = ({ setStep }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!role) {
      setError("Please select a role.");
      return;
    }
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        email: email,
        role: role,
      });

      setStep(2);
      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const goToLoginPage = () => {
    navigate("/login");
  };

  return (
    <Container maxWidth="sm" className="container">
      <CssBaseline />
      <div className="card">
        <Box className="card-header">
          <Typography variant="h5" className="title">
            Create an Account
          </Typography>
          <Typography variant="body1" className="subtitle">
            Please fill in the details to sign up for your account.
          </Typography>
        </Box>
        <Box
          component="form"
          onSubmit={handleSignUp}
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
          <FormControl fullWidth>
            <InputLabel id="role-select-label">Role</InputLabel>
            <Select
              labelId="role-select-label"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <MenuItem value="" disabled>
                Select Role
              </MenuItem>
              <MenuItem value="Manufacturer">Manufacturer</MenuItem>
              <MenuItem value="Courier">Courier</MenuItem>
              <MenuItem value="Certification Authority">Certification Authority</MenuItem>
              <MenuItem value="Customer">Customer</MenuItem>
            </Select>
          </FormControl>
          <Button
            type="submit"
            variant="contained"
            
           
            disabled={loading}
            className="sss"
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </Button>
        </Box>
        {error && (
          <Alert severity="error" className="error-alert">
            {error}
          </Alert>
        )}
        <Grid container justifyContent="center" className="login-link">
          <Grid item>
            <Typography variant="body2" className="login-text">
              Already have an account?{" "}
              <Button className="login-button" onClick={goToLoginPage}>
                Log In
              </Button>
            </Typography>
          </Grid>
        </Grid>
      </div>
    </Container>
  );
};

export default SignupPage;
