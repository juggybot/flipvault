import React, { useState, useEffect } from 'react';
import { Container, Typography, TextField, Select, MenuItem, Box, Button, CssBaseline, AppBar, Toolbar, Drawer, List, ListItem, ListItemIcon, ListItemText, Paper, IconButton } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Dashboard as DashboardIcon, ShoppingCart as ShoppingCartIcon, Settings as SettingsIcon, ExitToApp as ExitToAppIcon, Calculate as CalculateIcon} from '@mui/icons-material';
import { Link, Route, Routes, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Products from './Products';
import Settings from './Settings';
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

function FeeCalculatorPage() {
  const [salePrice, setSalePrice] = useState('');
  const [marketplace, setMarketplace] = useState('');
  const [selectedMarketplace, setSelectedMarketplace] = useState('');
  const [fee, setFee] = useState(null);
  const [error, setError] = useState(null);
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

  const handleCalculateFee = async () => {
    try {
      const response = await axios.post('https://flipvault-afea58153afb.herokuapp.com/api/calculate_fee', {
        sale_price: parseFloat(salePrice),
        marketplace: marketplace,
      });
      setFee(response.data.fee);
      setError(null);
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.error);
      } else {
        setError('An unexpected error occurred');
      }
      setFee(null);
    }
  };

  const marketplaceLogos = {
    Stockx: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/StockX_logo.svg/2560px-StockX_logo.svg.png",
    Ebay: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/EBay_logo.png/640px-EBay_logo.png",
    Depop: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Depop_logo.svg/2560px-Depop_logo.svg.png",
    Mercari: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRv7K-Qitcno3RyoxZ_bhp9PFzGu3nSVcztwA&s",
    Offerup: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/OfferUp_Logo.svg/2560px-OfferUp_Logo.svg.png",
    Poshmark: "https://upload.wikimedia.org/wikipedia/commons/4/44/Poshmark_logo.png",
  };

  const drawerWidth = 240;

  const drawerContent = (
    <>
      <Toolbar />
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

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
        <AppBar
          position="fixed"
          sx={{
            zIndex: (theme) => theme.zIndex.drawer + 1,
            width: isMobile ? '100%' : `calc(100% - ${drawerWidth}px)`,
            ml: isMobile ? 0 : `${drawerWidth}px`,
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
            position: 'fixed',
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: '#262626',
            borderRight: '1px solid rgba(255,255,255,0.12)',
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
          minHeight: '100vh',
          color: '#fff',
        }}
      >
        <Toolbar />
        <Container maxWidth="sm" sx={{ mt: 2 }}>
          <Typography variant="h4" sx={{ textAlign: 'center', mb: 2, color: '#fff', fontWeight: 'bold' }}>
            Fee Calculator
          </Typography>
          <Paper
            sx={{
              p: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: '#333',
              color: '#fff',
              borderRadius: 2,
            }}
          >
            <TextField
              label="Sale Price"
              variant="outlined"
              type="number"
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
              placeholder="Enter sale price"
              InputProps={{
                inputProps: { min: 0, max: 10000 },
                sx: { backgroundColor: "#444", color: "#fff", borderRadius: 1 }
              }}
              sx={{ mb: 2, width: '100%' }}
            />
            <Select
              label="Marketplace"
              variant="outlined"
              value={marketplace}
              onChange={(e) => setMarketplace(e.target.value)}
              sx={{
                backgroundColor: "#444",
                color: "#fff",
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                mb: 2,
              }}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <img
                    src={marketplaceLogos[selected]}
                    alt={selected}
                    style={{ width: 100, height: 25, marginRight: 10 }}
                  />
                </Box>
              )}
            >
              {Object.keys(marketplaceLogos).map((mp) => (
                <MenuItem key={mp} value={mp} sx={{ display: 'flex', alignItems: 'center' }}>
                  <img
                    src={marketplaceLogos[mp]}
                    alt={mp}
                    style={{ width: 100, height: 25, marginRight: 10 }}
                  />
                </MenuItem>
              ))}
            </Select>
            <ModernButton
              variant="contained"
              color="primary"
              onClick={() => {
                handleCalculateFee();
                setSelectedMarketplace(marketplace);
              }}
              sx={{
                backgroundColor: '#1e88e5',
                '&:hover': { backgroundColor: '#1565c0' },
              }}
            >
              Calculate Fee
            </ModernButton>
            {fee !== null && (
              <Box sx={{ mt: 2, p: 2, border: '1px solid', borderColor: 'grey.300', borderRadius: 1, backgroundColor: '#444', width: '100%' }}>
                <Typography variant="h6" align="center" color="#fff">
                  The fee for selling on {selectedMarketplace} is ${typeof fee === 'number' ? fee.toFixed(2) : 'N/A'}
                </Typography>
              </Box>
            )}
            {error && (
              <Box sx={{ mt: 2, p: 2, border: '1px solid', borderColor: 'error.main', borderRadius: 1, backgroundColor: '#444', width: '100%' }}>
                <Typography variant="h6" color="error" align="center">
                  An error occurred, try again later
                </Typography>
              </Box>
            )}
          </Paper>
        </Container>
        <Routes>
          <Route path="/products" element={<Products />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/user-dashboard" element={<UserDashboard />} />
        </Routes>
      </Box>
    </ThemeProvider>
  );
}

export default FeeCalculatorPage;