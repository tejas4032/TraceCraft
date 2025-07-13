import React, { useEffect } from "react";

const MetaMaskPage = ({ setStep }) => {
  useEffect(() => {
    const connectMetaMask = async () => {
      if (window.ethereum) {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        setStep(4); // Move to the main app page (step 4) after MetaMask connection
      } else {
        alert("Please install MetaMask!");
      }
    };

    connectMetaMask();
  }, [setStep]);

  return (
    <div>
      <h2>Connecting to MetaMask...</h2>
    </div>
  );
};

export default MetaMaskPage;