import React, { useState, useEffect } from 'react';
import { Container, Typography, Paper, Box, Button, FormControl, InputLabel, Select, MenuItem, Grid, AppBar, Toolbar, CssBaseline, Drawer, List, ListItem, ListItemIcon, ListItemText, IconButton } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Dashboard as DashboardIcon, ShoppingCart as ShoppingCartIcon, Settings as SettingsIcon, ExitToApp as ExitToAppIcon, Calculate as CalculateIcon } from '@mui/icons-material';
import { Link, Route, Routes, useNavigate } from 'react-router-dom';
import FeeCalculatorPage from './FeeCalculator';
import Products from './Products';
import Logout from './Logout';
import UserDashboard from './UserDashboard';
import { styled } from '@mui/system';
import useMediaQuery from '@mui/material/useMediaQuery';
import MenuIcon from '@mui/icons-material/Menu';
import { requirePaidPlan } from '../services/api';

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

// Styled Button Component
const ModernButton = styled(Button)({
  borderRadius: '8px',
  padding: '12px 24px',
  fontSize: '1rem',
  fontWeight: 600,
  boxShadow: 'none',
  textTransform: 'none',
  '&:hover': {
    boxShadow: '0px 3px 5px rgba(0,0,0,0.2)',
  },
});

function Settings() {
  const [currency, setCurrency] = React.useState('USD');
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  const isMobile = useMediaQuery('(max-width:768px)');
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  useEffect(() => {
    let isMounted = true;

    const storedUsername = localStorage.getItem('username');
    if (isMounted && storedUsername) {
      setUsername(storedUsername);
    }

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCurrencyChange = (event) => {
    const newCurrency = event.target.value;
    setCurrency(newCurrency);
    localStorage.setItem('currency', newCurrency);
  };

  const drawerWidth = 240;

  const drawerContent = (
    <>
      <Box sx={{ overflow: 'auto' }}>
        <List>
          <ListItem button component={Link} to="/user-dashboard" sx={{ color: 'text.primary' }} onClick={isMobile ? handleDrawerToggle : undefined}>
            <ListItemIcon sx={{ color: 'text.primary' }}>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItem>
          <ListItem button component={Link} to="/products" sx={{ color: 'text.primary' }} onClick={isMobile ? handleDrawerToggle : undefined}>
            <ListItemIcon sx={{ color: 'text.primary' }}>
              <ShoppingCartIcon />
            </ListItemIcon>
            <ListItemText primary="Products" />
          </ListItem>
          <ListItem button component={Link} to="/fee-calculator" sx={{ color: 'text.primary' }} onClick={isMobile ? handleDrawerToggle : undefined}>
            <ListItemIcon sx={{ color: 'text.primary' }}>
              <CalculateIcon />
            </ListItemIcon>
            <ListItemText primary="Fee Calculator" />
          </ListItem>
          <ListItem button component={Link} to="/settings" sx={{ color: 'text.primary' }} onClick={isMobile ? handleDrawerToggle : undefined}>
            <ListItemIcon sx={{ color: 'text.primary' }}>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItem>
          <ListItem button component={Link} to="/logout" sx={{ color: 'text.primary' }} onClick={isMobile ? handleDrawerToggle : undefined}>
            <ListItemIcon sx={{ color: 'text.primary' }}>
              <ExitToAppIcon />
            </ListItemIcon>
            <ListItemText primary="Log Out" />
          </ListItem>
        </List>
      </Box>
    </>
  ); 

  const handleLinkDiscord = () => {
    window.location.href =
      "https://discord.com/api/oauth2/authorize?client_id=1332596449145393162&redirect_uri=test.com&response_type=code&scope=identify";
  };

  const handleCancelSubscription = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/cancel-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ username }),
      });
      if (response.ok) {
        alert('Subscription cancelled successfully');
      } else {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to cancel subscription');
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,  // Ensures appbar stays above drawer
          width: '100%',  // Changed from conditional width
          background: 'linear-gradient(45deg, #333, #555)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            FlipVault
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {username}
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : true}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: '#262626',
            borderRight: '1px solid rgba(255,255,255,0.12)',
            zIndex: (theme) => theme.zIndex.appBar - 1,  // Drawer behind app bar
            marginTop: '64px',  // Height of your app bar (adjust if needed)
            height: 'calc(100vh - 64px)',  // Adjust height to account for app bar
          },
        }}
      >
        {drawerContent}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          marginLeft: isMobile ? 0 : `${drawerWidth}px`,
          backgroundColor: '#121212',
          minHeight: 'calc(100vh - 64px)',  // Adjust for app bar
          color: '#fff',
        }}
      >
        <Toolbar />
        <Container maxWidth="md" sx={{ mt: 4 }}>
          <Typography variant="h4" sx={{ textAlign: 'center', mb: 3, color: '#fff', fontWeight: 'bold' }}>
            SETTINGS
          </Typography>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#333',
              color: '#fff',
              borderRadius: 2,
            }}
          >
            {/* Currency selection */}
            <Box my={2}>
              <Typography variant="subtitle1" gutterBottom>
                Select Currency
              </Typography>
              <FormControl fullWidth variant="outlined" sx={{ backgroundColor: '#444', color: '#fff', borderRadius: 1 }}>
                <InputLabel id="currency-label" sx={{ color: '#9e9e9e' }}>Currency</InputLabel>
                <Select
                  labelId="currency-label"
                  id="currency-select"
                  value={currency}
                  onChange={(event) => {
                    const newCurrency = event.target.value;
                    handleCurrencyChange(event);
                    localStorage.setItem('currency', newCurrency);
                  }}
                  label="Currency"
                  sx={{ color: '#fff' }}
                >
                  <MenuItem value="USD">USD</MenuItem>
                  <MenuItem value="AUD">AUD</MenuItem>
                  <MenuItem value="EUR">EUR</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Subscription management */}
            <Box
              my={2}
              p={2}
              sx={{
                border: 1,
                borderColor: 'grey.400',
                borderRadius: 2,
              }}
            >
              <Typography variant="subtitle1" gutterBottom>
                Subscription
              </Typography>
              <Box mt={1} sx={{ display: 'flex', gap: 2 }}>
                <ModernButton 
                  variant="contained" 
                  color="secondary" 
                  onClick={handleCancelSubscription}
                >
                  Cancel Subscription
                </ModernButton>
              </Box>
            </Box>

            {/* Discord account linking */}
            <Box my={2}>
              <Typography variant="subtitle1" gutterBottom>
                Discord Account
              </Typography>
              <Typography variant="body2" sx={{ color: 'grey.300' }}>
                Link your Discord account to sync with your current account.
              </Typography>
              <ModernButton variant="outlined" sx={{ mt: 2 }} onClick={() => {}}>
                COMING SOON
              </ModernButton>
            </Box>
          </Paper>
        </Container>
        <Routes>
          <Route path="/user-dashboard" element={<UserDashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/fee-calculator" element={<FeeCalculatorPage />} />
        </Routes>
      </Box>
    </ThemeProvider>
  );
}

export default Settings;