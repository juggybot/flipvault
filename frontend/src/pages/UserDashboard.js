import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Paper, Box, AppBar, Toolbar, IconButton, Menu, MenuItem, CssBaseline, Button, Avatar, Drawer, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Menu as MenuIcon, Dashboard as DashboardIcon, ShoppingCart as ShoppingCartIcon, Settings as SettingsIcon, LocalShipping as LocalShippingIcon, People as PeopleIcon, ExitToApp as ExitToAppIcon, Calculate as CalculateIcon } from '@mui/icons-material';
import { Link, Route, Routes } from 'react-router-dom';
import FeeCalculatorPage from './FeeCalculator'; // Import the new page
import Products from './Products';
import Settings from './Settings';
import Logout from './Logout';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
    background: {
      default: '#1c1c1c',
      paper: '#2c2c2c',
    },
    text: {
      primary: '#ffffff',
    },
  },
});

function UserDashboard() {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [username, setUsername] = useState('');
  const [subscriptionDate, setSubscriptionDate] = useState(''); // Example date, replace with actual data

  useEffect(() => {
    // Retrieve username from local storage or context
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
    // Set a dummy subscription date for demonstration
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1); // Set to one year from now
    setSubscriptionDate(date.toLocaleDateString('en-AU', { year: 'numeric', month: '2-digit', day: '2-digit' }));
  }, []);

  const drawerWidth = 240;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          background: 'linear-gradient(45deg, #333, #555)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        }}
      >
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            FlipVault
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {username}
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: '#262626',
            borderRight: '1px solid rgba(255,255,255,0.12)',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            <ListItem
              button
              component={Link}
              to="/user-dashboard"
              sx={{
                color: 'text.primary',
                '&:hover': { backgroundColor: 'rgba(144,202,249,0.1)' },
              }}
            >
              <ListItemIcon sx={{ color: 'text.primary' }}>
                <DashboardIcon />
              </ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItem>
            <ListItem
              button
              component={Link}
              to="/products"
              sx={{
                color: 'text.primary',
                '&:hover': { backgroundColor: 'rgba(144,202,249,0.1)' },
              }}
            >
              <ListItemIcon sx={{ color: 'text.primary' }}>
                <ShoppingCartIcon />
              </ListItemIcon>
              <ListItemText primary="Products" />
            </ListItem>
            <ListItem
              button
              component={Link}
              to="/fee-calculator"
              sx={{
                color: 'text.primary',
                '&:hover': { backgroundColor: 'rgba(144,202,249,0.1)' },
              }}
            >
              <ListItemIcon sx={{ color: 'text.primary' }}>
                <CalculateIcon />
              </ListItemIcon>
              <ListItemText primary="Fee Calculator" />
            </ListItem>
            <ListItem
              button
              component={Link}
              to="/settings"
              sx={{
                color: 'text.primary',
                '&:hover': { backgroundColor: 'rgba(144,202,249,0.1)' },
              }}
            >
              <ListItemIcon sx={{ color: 'text.primary' }}>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary="Settings" />
            </ListItem>
            <ListItem
              button
              component={Link}
              to="/logout"
              sx={{
                color: 'text.primary',
                '&:hover': { backgroundColor: 'rgba(144,202,249,0.1)' },
              }}
            >
              <ListItemIcon sx={{ color: 'text.primary' }}>
                <ExitToAppIcon />
              </ListItemIcon>
              <ListItemText primary="Log Out" />
            </ListItem>
          </List>
        </Box>
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          marginLeft: `${drawerWidth}px`,
          minHeight: '100vh',
          backgroundColor: '#121212',
        }}
      >
        <Toolbar />
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Typography variant="h4" sx={{ textAlign: 'center', mb: 2, color: '#fff', fontWeight: 'bold' }}>USER DASHBOARD</Typography>
          <Grid container spacing={3}>
            
            <Grid item xs={12} md={6}>
              <Paper
                sx={{
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: '#333',
                  color: '#fff',
                  borderRadius: 2,
                  boxShadow: '0px 4px 12px rgba(0,0,0,0.15)',
                }}
              >
                <Typography variant="h6" gutterBottom fontWeight="medium">
                  User Logged In
                </Typography>
                <Typography variant="body1">{username}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper
                sx={{
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: '#333',
                  color: '#fff',
                  borderRadius: 2,
                  boxShadow: '0px 4px 12px rgba(0,0,0,0.15)',
                }}
              >
                <Typography variant="h6" gutterBottom fontWeight="medium">
                  Subscription Date
                </Typography>
                <Typography variant="body1">{subscriptionDate}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper
                sx={{
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: '#333',
                  color: '#fff',
                  borderRadius: 2,
                  boxShadow: '0px 4px 12px rgba(0,0,0,0.15)',
                }}
              >
                <Typography variant="h6" gutterBottom fontWeight="medium">
                  Product News / Alerts
                </Typography>
                <Typography variant="body1">No new alerts.</Typography>
              </Paper>
            </Grid>
          </Grid>
          <Routes>
            <Route path="/user-dashboard" element={<UserDashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/fee-calculator" element={<FeeCalculatorPage />} />
          </Routes>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default UserDashboard;