import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  List,
  ListItem,
  ListItemText,
  CssBaseline,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

// Components for dynamic right-hand side content
import AddProduct from './AddProduct'; // Assume you have this component
import AllProducts from './AllProducts'; // Assume you have this component
import AddBatch from './AddBatch'; // Assume you have this component

const ManufacturerDashboard = () => {
  const navigate = useNavigate();
  const [activeButton, setActiveButton] = useState('addBatch'); // Default active button
  const [rightContent, setRightContent] = useState(<AddBatch />); // Default right-hand content
  const [sidebarOpen, setSidebarOpen] = useState(true); // State for managing sidebar visibility
  const [manufacturerEmail, setManufacturerEmail] = useState('manufacturer@example.com'); // Sample email of the manufacturer

  // Function to extract the username from the email
  const getUsernameFromEmail = (email) => {
    return email.split('@')[0]; // Get the part before '@'
  };

  const handleSidebarClick = (action) => {
    setActiveButton(action);

    if (action === 'addProduct') {
      setRightContent(<AddProduct />);
    } else if (action === 'allProducts') {
      setRightContent(<AllProducts />);
    } else if (action === 'addBatch') {
      setRightContent(<AddBatch />);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      {/* Sidebar */}
      <Drawer
        sx={{
          width: 240,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: 240,
            boxSizing: "border-box",
            boxShadow: "4px 0px 8px rgba(0, 0, 0, 0.2)", // Add shadow to the right side of the sidebar
          },
        }}
        variant={sidebarOpen ? "persistent" : "temporary"} // Toggle between persistent and temporary drawer
        anchor="left"
        open={sidebarOpen}
        onClose={toggleSidebar}
      >
        <Box sx={{ paddingTop: 5, textAlign: "center" }}>
          <Typography variant="h5" color="primary" gutterBottom>
            Manufacturer Dashboard
          </Typography>
        </Box>
        <List>
          {/* Sidebar buttons */}
          <ListItem
            button
            onClick={() => handleSidebarClick('addProduct')}
            sx={{
              backgroundColor: activeButton === 'addProduct' ? '#1976d2' : 'transparent',
              color: activeButton === 'addProduct' ? 'white' : 'inherit',
              '&:hover': {
                backgroundColor: '#1976d2',
              },
            }}
          >
            <ListItemText primary="Add Product" />
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
            onClick={() => handleSidebarClick('addBatch')}
            sx={{
              backgroundColor: activeButton === 'addBatch' ? '#1976d2' : 'transparent',
              color: activeButton === 'addBatch' ? 'white' : 'inherit',
              '&:hover': {
                backgroundColor: '#1976d2',
              },
            }}
          >
            <ListItemText primary="Add Batch" />
          </ListItem>
        </List>
        
        {/* Display username at the bottom */}
        <Box sx={{ position: "absolute", bottom: 20, left: 20 }}>
          <Typography variant="body2" color="textSecondary">
            {getUsernameFromEmail(manufacturerEmail)}
          </Typography>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          backgroundColor: "#f4f6f8",
          padding: "0.5rem", // Reduced padding here
          height: "100vh",
          overflowY: "auto",
          transition: 'margin-left 0.3s', // Smooth transition for sliding effect
        }}
      >
        {/* Header Bar */}
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              sx={{
                marginRight: 2,
              }}
              onClick={toggleSidebar} // Toggle sidebar when menu icon is clicked
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap>
              Manufacturer Dashboard
            </Typography>
          </Toolbar>
        </AppBar>

        <Box sx={{ paddingTop: "64px", paddingBottom: "2rem" }}>
          {/* Dynamic Content */}
          {rightContent}
        </Box>
      </Box>
    </Box>
  );
};

export default ManufacturerDashboard;