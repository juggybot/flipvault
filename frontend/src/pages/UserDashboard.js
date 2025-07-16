import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Paper, Box, AppBar, Toolbar, IconButton, Menu, MenuItem, CssBaseline, Button, Avatar, Drawer, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Menu as MenuIcon, Dashboard as DashboardIcon, ShoppingCart as ShoppingCartIcon, Settings as SettingsIcon, LocalShipping as LocalShippingIcon, People as PeopleIcon, ExitToApp as ExitToAppIcon, Calculate as CalculateIcon } from '@mui/icons-material';
import { Link, Route, Routes, useNavigate } from 'react-router-dom';
import FeeCalculatorPage from './FeeCalculator'; // Import the new page
import Products from './Products';
import Settings from './Settings';
import Logout from './Logout';
import useMediaQuery from '@mui/material/useMediaQuery';
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

function UserDashboard() {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [username, setUsername] = useState('');
  const [subscriptionDate, setSubscriptionDate] = useState('');
  const [subscriptionEnd, setSubscriptionEnd] = useState('');
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width:768px)');
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  useEffect(() => {
    let isMounted = true;

    const checkAccess = async () => {
      const hasPaidPlan = await requirePaidPlan();
      if (isMounted && !hasPaidPlan) {
        navigate('/pricing');
      }
    };
    
    checkAccess();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  useEffect(() => {
    let isMounted = true;
    const storedUsername = localStorage.getItem('username');
    if (isMounted && storedUsername) {
      setUsername(storedUsername);
      // Fetch user info from backend
      fetch(`/user/plan/${storedUsername}`)
        .then(res => res.json())
        .then(data => {
          if (data.subscription_end) {
            setSubscriptionEnd(new Date(data.subscription_end).toLocaleString());
          } else {
            setSubscriptionEnd('LIFETIME');
          }
        })
        .catch(() => {
          setSubscriptionDate('N/A');
          setSubscriptionEnd('LIFETIME');
        });
    }
    return () => {
      isMounted = false;
    };
  }, []);

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

  // New state to track best performing products over the last 24/48 hrs
  const [bestProducts, setBestProducts] = useState([]);

  useEffect(() => {
    // Simulate fetching best performing products from an API or database.
    // Replace this simulation with an actual API call if available.
    const fetchBestProducts = async () => {
      // Dummy data representing products performing well in the last 24/48 hrs.
      const data = [
        { id: 1, name: "Product A", period: "24hrs", score: 85 },
        { id: 2, name: "Product B", period: "48hrs", score: 90 },
      ];
      setBestProducts(data);
    };

    fetchBestProducts();
  }, []);

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
          minHeight: '100vh',           // Full viewport height
          height: '100%',               // Ensures full coverage
          marginTop: '64px',            // Accounts for AppBar
          paddingBottom: '64px',        // Accounts for potential footer
          color: '#fff',
          boxSizing: 'border-box',      // Includes padding in height calculations
          overflow: 'auto',             // Adds scroll if content exceeds viewport
        }}
      >
        <Toolbar />
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Typography variant="h4" sx={{ textAlign: 'center', mb: 2, color: '#fff', fontWeight: 'bold' }}>
            USER DASHBOARD
          </Typography>
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
                  Subscription End
                </Typography>
                <Typography variant="body1">{subscriptionEnd}</Typography>
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
                  Update Log
                </Typography>
                <Typography variant="body1">V0.1 - Initial release</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper
                sx={{
                  p: 3,
                  backgroundColor: '#333',
                  color: '#fff',
                  borderRadius: 2,
                  boxShadow: '0px 4px 12px rgba(0,0,0,0.15)',
                }}
              >
                <Typography variant="h6" gutterBottom fontWeight="medium">
                  Top Performing Products (Last 24/48 hrs)
                </Typography>
                {bestProducts.length ? (
                  bestProducts.map((product) => (
                    <Typography key={product.id} variant="body1">
                      {product.name} ({product.period}) - Score: {product.score}
                    </Typography>
                  ))
                ) : (
                  <Typography variant="body1">No top performing products at the moment.</Typography>
                )}
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