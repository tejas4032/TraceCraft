import React, { useState, useEffect } from "react";
import Web3 from "web3";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import AddProduct from "./components/AddProduct";
import GetProduct from "./components/GetProduct";
import LandingPage from "./components/LandingPage";
import AssignCourier from "./components/AssignCourier";
import LoginPage from "./components/LoginPage";
import SignupPage from "./components/SignupPage";
import MetaMaskPage from "./components/MetaMaskPage"; // Ensure this is the correct component
import LogisticsPartner from "./components/LogisticsPartner";
import AllProducts from "./components/AllProducts"; // Incorrect import for CheckpointComponent
import ManufacturerDashboard from "./components/ManufacturerDashboard";
import CourierDashboard from "./components/CourierDashboard";
import { auth, db } from "./firebase"; // Assuming firebase is configured
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import CertificateAuthority from "./components/CertificateAuthority";
import { contractABI, contractAddress } from "./config/contractConfig";
import CheckpointComponent from "./components/CheckpointComponent"; // Correct import for CheckpointComponent
import AddBatch from "./components/AddBatch";

const App = () => {
  const [manufacturerAccount, setManufacturerAccount] = useState(null);
  const [courierAccount, setCourierAccount] = useState(null);
  const [certificateAuthorityAccount, setCertificateAuthorityAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [step, setStep] = useState(1); // Track the current step in the flow

  const connectToMetaMask = async () => {
    if (window.ethereum) {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const web3 = new Web3(window.ethereum);
      const accounts = await web3.eth.getAccounts();
      setManufacturerAccount(accounts[0]);
      setCourierAccount(accounts[1]);
      setCertificateAuthorityAccount(accounts[2]);
      const contractInstance = new web3.eth.Contract(contractABI, contractAddress);
      setContract(contractInstance);
    } else {
      console.log("MetaMask is not installed");
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role);
          setIsAuthenticated(true);
        }
      } else {
        setIsAuthenticated(false);
        setUserRole(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (step === 4) {
      connectToMetaMask();
    }
  }, [step]);

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Step 1: Sign Up */}
          <Route path="/signup" element={<SignupPage setStep={setStep} />} />

          {/* Step 2: Login */}
          <Route
            path="/login"
            element={
              <LoginPage
                setIsAuthenticated={setIsAuthenticated}
                setStep={setStep}
                connectToMetaMask={connectToMetaMask} // Pass connectToMetaMask here
              />
            }
          />

          {/* Step 3: MetaMask Authentication */}
          <Route path="/metamask" element={<MetaMaskPage setStep={setStep} />} />

          {/* Manufacturer Dashboard and Features */}
          {isAuthenticated && userRole === "Manufacturer" && (
            <>
              <Route path="/manufacturer-dashboard" element={<ManufacturerDashboard />} />
              <Route
                path="/add-product"
                element={<AddProduct contract={contract} account={manufacturerAccount} />}
              />
              <Route
                path="/get-product"
                element={<GetProduct contract={contract} />}
              />
              <Route
                path="/add-batch"
                element={<AddBatch contract={contract} />}
              />
            </>
          )}

          {/* Courier Dashboard and Features */}
          {isAuthenticated && userRole === "Courier" && (
            <>
              <Route
                path="/courier-dashboard"
                element={<CourierDashboard contract={contract} account={courierAccount} />}
              />
              <Route
                path="/checkpoint"
                element={<CheckpointComponent contract={contract} account={courierAccount} />}
              />
              <Route
                path="/assign-courier"
                element={<AssignCourier contract={contract} account={courierAccount} />}
              />
              <Route
                path="/logistics-partner"
                element={<LogisticsPartner contract={contract} account={courierAccount} />}
              />
              
              
            </>
          )}

          {/* Certificate Authority Dashboard and Features */}
          {isAuthenticated && userRole === "Certification Authority" && (
            <>
              <Route
                path="/certificate-authority"
                element={<CertificateAuthority contract={contract} account={certificateAuthorityAccount} />}
              />
            </>
          )}

           {/* Customer Dashboard */}
           {isAuthenticated && userRole === "Customer" && (
            <>
              <Route
                path="/get-Product"
                element={<GetProduct contract={contract} account={certificateAuthorityAccount} />}
              />
            </>
          )}

          {/* Common Features */}
          {isAuthenticated && (
            <Route
              path="/all-products"
              element={<AllProducts contract={contract} />}
            />
          )}

          {/* Default Redirect Based on Role */}
          <Route
            path="/"
            element={
              isAuthenticated
                ? userRole === "Manufacturer"
                  ? <Navigate to="/manufacturer-dashboard" />
                  : userRole === "Courier"
                  ? <Navigate to="/courier-dashboard" />
                  : userRole === "Certification Authority"
                  ? <Navigate to="/certificate-authority" />
                  : <Navigate to="/login" />
                : <Navigate to="/signup" />
            }
          />

          {/* Fallback for Unauthorized Access */}
          <Route path="*" element={<Navigate to="/" />} />{" "}
        </Routes>
      </div>
    </Router>
  );
};

export default App;
