import React, { useState } from 'react';

const LogisticsPartner = ({ contract, account }) => {
  const [productId, setProductId] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Function to handle courier assignment
  const assignCourierToProduct = async () => {
    try {
      if (!productId) {
        alert('Please enter a valid Product ID.');
        return;
      }

      await contract.methods.assignCourier(productId).send({ from: account });
      setSuccessMessage('Courier assigned to product successfully!');
      setErrorMessage(''); // Clear any previous error messages
      setProductId(''); // Clear the input field
    } catch (err) {
      console.error('Error assigning courier:', err);
      setErrorMessage('Failed to assign courier. Please try again.');
      setSuccessMessage(''); // Clear any previous success messages
    }
  };

  return (
    <div>
      <h2>Logistics Partner</h2>
      <div>
        <label htmlFor="productId">Enter Product ID:</label>
        <input
          type="text"
          id="productId"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          placeholder="Enter Product ID"
          style={{ margin: '10px', padding: '5px', width: '200px' }}
        />
        <button onClick={assignCourierToProduct} style={{ padding: '5px 10px' }}>
          Assign Courier
        </button>
      </div>
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
    </div>
  );
};

export default LogisticsPartner;
