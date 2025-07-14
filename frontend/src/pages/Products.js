import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Grid, Paper, Box, AppBar, Toolbar, CssBaseline, Button, Drawer, List,
  ListItem, ListItemIcon, ListItemText, TextField, CircularProgress, IconButton
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
  Dashboard as DashboardIcon, ShoppingCart as ShoppingCartIcon, Settings as SettingsIcon,
  Calculate as CalculateIcon, ExitToApp as ExitToAppIcon
} from '@mui/icons-material';
import { BrowserRouter, Link, Route, Routes, useNavigate } from 'react-router-dom';
import FeeCalculatorPage from './FeeCalculator';
import Settings from './Settings';
import Logout from './Logout';
import UserDashboard from './UserDashboard';
import ProductCard from '../components/ProductCard';
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

function Products() {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
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
    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('https://flipvault-afea58153afb.herokuapp.com/products?skip=0&limit=10', {
        credentials: 'include',
        headers: {
          'Authorization': 'Basic ' + btoa('juggy:Idus1234@@'),
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error: ${response.status} - ${errorData.detail}`);
      }

      const data = await response.json();

      // ✅ Filter out products with title "test product" (case-insensitive)
      const filteredProducts = data.filter(
        product => product.title !== 'Test Product'
      );

      setProducts(filteredProducts);
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    if (!query) {
      alert('Search query cannot be empty');
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(`https://flipvault-afea58153afb.herokuapp.com/search/?query=${query}`);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Search error:', error);
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
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
        {/* Search Box */}
        <Container maxWidth="sm" sx={{ mt: 2 }}>
          <Typography variant="h4" sx={{ textAlign: 'center', mb: 2, color: '#fff', fontWeight: 'bold' }}>PRODUCTS</Typography>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: '#333',
              color: '#fff',
              borderRadius: 2,
            }}
          >
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search products"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown} // Trigger search on Enter
              sx={{
                mb: 2,
                backgroundColor: '#444',
                color: '#fff',
                borderRadius: 1,
                '& .MuiOutlinedInput-root': { color: '#fff' },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#555' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#777' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main },
              }}
            />
            <ModernButton
              variant="contained"
              color="primary"
              onClick={handleSearch}
              disabled={loading}
              sx={{
                backgroundColor: '#1e88e5',
                '&:hover': { backgroundColor: '#1565c0' },
              }}
            >
              {loading ? <CircularProgress size={24} /> : 'SEARCH'}
            </ModernButton>
          </Paper>
        </Container>
        <Container sx={{ mt: 4 }}>
          <Grid container spacing={4}>
            {products.map((product) => (
              <Grid item key={product.id} xs={12} sm={6} md={4}>
                <Paper
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    backgroundColor: '#333',
                    color: '#fff',
                    '&:hover': { boxShadow: 6, backgroundColor: '#444' },
                  }}
                  onClick={() => {
                    const productId = parseInt(product?.id, 10);
                    if (!isNaN(productId)) {
                      navigate(`/productcard/${productId}`);
                    } else {
                      console.error('Invalid product ID:', product?.id);
                    }
                  }}
                >
                  <img
                    src={product.image_url}
                    alt={product.name}
                    style={{ width: '100%', borderRadius: '4px' }}
                  />
                  <Typography variant="h6" sx={{ mt: 2 }}>
                    {product.name}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
        <Routes>
          <Route path="/fee-calculator" element={<FeeCalculatorPage />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/user-dashboard" element={<UserDashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/productcard/:productId" element={<ProductCard />} />
        </Routes>
      </Box>
    </ThemeProvider>
  );
}

export default Products;