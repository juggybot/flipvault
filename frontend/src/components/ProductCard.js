import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import LoadingState from './LoadingState';
import EnhancedErrorBoundary from './EnhancedErrorBoundary';
import { Container, Typography, Paper, Box, AppBar, Toolbar, CssBaseline, Button, Drawer, List, ListItem, ListItemIcon, ListItemText, Tooltip, CircularProgress, LinearProgress } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Dashboard as DashboardIcon, ShoppingCart as ShoppingCartIcon, Settings as SettingsIcon, Calculate as CalculateIcon, ExitToApp as ExitToAppIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { styled } from '@mui/system';

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

function ProductCard() {
  const [error, setError] = useState(null);
  const { productId } = useParams();
  const parsedProductId = parseInt(productId, 10);
  const [product, setProduct] = useState(null);
  const [currency, setCurrency] = useState(localStorage.getItem('currency') || 'USD');
  const [username, setUsername] = useState('');

  useEffect(() => {
    let isMounted = true;
    // Retrieve currency from local storage
    const storedCurrency = localStorage.getItem('currency');
    const storedUsername = localStorage.getItem('username');
    
    if (isMounted) {
      if (storedCurrency) setCurrency(storedCurrency);
      if (storedUsername) setUsername(storedUsername);
    }

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    const fetchProduct = async () => {
      if (isNaN(parsedProductId)) {
        setError('Invalid product ID');
        return;
      }

      try {
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/products/${parsedProductId}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Authorization': 'Basic ' + btoa('juggy:Idus1234@@'),
            'Content-Type': 'application/json'
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (isMounted) {
          setProduct({
            ...data,
            ...data.data,
          });
          setError(null);
        }
      } catch (error) {
        if (isMounted) {
          setError(error.message);
          console.error('Fetch error:', error);
        }
      }
    };

    fetchProduct();

    return () => {
      isMounted = false;
    };
  }, [parsedProductId]);

  const drawerWidth = 240;

  const SearchVolumeItem = ({ country, flagUrl, searchVolume }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
      <Tooltip title={country} arrow>
        <img src={flagUrl} alt={country} style={{ width: '24px', marginRight: '8px' }} />
      </Tooltip>
      <Typography variant="body1">{searchVolume ? `${searchVolume} Searches` : <CircularProgress size={20} />}</Typography>
    </Box>
  );

  const InfoItem = ({ title, value }) => (
    <Box sx={{ mb: 2 }}>
      <Typography variant="h6">{title}</Typography>
      <Typography variant="body1">
        {value !== undefined && value !== null ? value : (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CircularProgress size={20} sx={{ mr: 1 }} />
            Loading...
          </Box>
        )}
      </Typography>
    </Box>
  );

  const keywords = product?.popular_keywords || [];
  const sampleScores = keywords.map(keyword => {
    const vowels = 'aeiouAEIOU';
    const baseScore = keyword.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const vowelCount = keyword.split('').filter(char => vowels.includes(char)).length;
    const lengthBonus = keyword.length * 5;
    const score = baseScore + vowelCount * 20 + lengthBonus;
    return score % 100; // Ensure the score is between 0 and 99
  });

  const capitalizeWords = (str) => {
    return str
      .split(' ') // Split by spaces
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize the first letter of each word
      .join(' '); // Join them back together
  };

  const KeywordsList = ({ keywords, scores = [] }) => (
  <Paper sx={{ p: 2, mb: 2 }}>
    <Typography variant="h5" sx={{ mb: 1 }}>Top Keywords</Typography>
    {keywords.length > 0 ? (
      keywords.slice(0, 5).map((keyword, index) => (
        <ListItem
          key={index}
          sx={{
            display: 'flex',
            alignItems: 'flex-start', // align to top so bar aligns with first line
            padding: '4px 0',
            gap: 2,  // space between text and progress bar
          }}
        >
          <ListItemText 
            primary={capitalizeWords(keyword)} 
            sx={{ 
              maxWidth: '45%',   // fixed width so bars align
              whiteSpace: 'normal',  // allow wrapping
              overflowWrap: 'break-word',  // wrap long words
              flexShrink: 0,
            }} 
          />
          <Box sx={{ flexGrow: 1, mt: '6px' }}> {/* slight margin top to center vertically with wrapped text */}
            <LinearProgress
              variant="determinate"
              value={scores[index] || 0}
              sx={{ height: 10, borderRadius: 5 }}
            />
          </Box>
        </ListItem>
      ))
    ) : (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <CircularProgress size={20} sx={{ mr: 1 }} />
        Loading...
      </Box>
    )}
  </Paper>
);

  const convertPrice = (price) => {
    if (price === null || price === undefined) {
      return 'Loading...';
    }

    const exchangeRates = {
      USD: 1,
      EUR: 0.92, // Example rate, update as needed
      AUD: 1.52, // Example rate, update as needed
    };

    const convertedPrice = price * exchangeRates[currency];

    const formattedPrice = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(convertedPrice);

    return formattedPrice;
  };

  return (
    <ThemeProvider theme={theme}>
      <EnhancedErrorBoundary>
        <CssBaseline />
        <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <Typography variant="h6" style={{ flexGrow: 1 }}>
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
            [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
          }}
        >
          <Toolbar />
          <Box sx={{ overflow: 'auto' }}>
            <List>
              <ListItem button component={Link} to="/user-dashboard" sx={{ color: 'text.primary' }}>
                <ListItemIcon sx={{ color: 'text.primary' }}>
                  <DashboardIcon />
                </ListItemIcon>
                <ListItemText primary="Dashboard" />
              </ListItem>
              <ListItem button component={Link} to="/products" sx={{ color: 'text.primary' }}>
                <ListItemIcon sx={{ color: 'text.primary' }}>
                  <ShoppingCartIcon />
                </ListItemIcon>
                <ListItemText primary="Products" />
              </ListItem>
              <ListItem button component={Link} to="/fee-calculator" sx={{ color: 'text.primary' }}>
                <ListItemIcon sx={{ color: 'text.primary' }}>
                  <CalculateIcon />
                </ListItemIcon>
                <ListItemText primary="Fee Calculator" />
              </ListItem>
              <ListItem button component={Link} to="/settings" sx={{ color: 'text.primary' }}>
                <ListItemIcon sx={{ color: 'text.primary' }}>
                  <SettingsIcon />
                </ListItemIcon>
                <ListItemText primary="Settings" />
              </ListItem>
              <ListItem button component={Link} to="/logout" sx={{ color: 'text.primary' }}>
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
          {error ? (
            <Typography color="error" sx={{ mt: 2, textAlign: 'center' }}>
              {error}
            </Typography>
          ) : !product ? (
            <LoadingState text="Loading product details..." />
          ) : (
            <>
              <Container maxWidth="sm" sx={{ mt: 2 }}>
                <Box sx={{ backgroundColor: '#333', color: '#fff', padding: 4, borderRadius: 2, flex: 1, mr: 2 }}>
                  {!product.image_url ? (
                    <LoadingState variant="skeleton" height={256} width={256} />
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                      <img
                        src={product.image_url}
                        alt={product.name}
                        style={{ maxWidth: '100%', height: 'auto', borderRadius: 8 }}
                      />
                    </Box>
                  )}

                  <Typography
                    variant="h4"
                    sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}
                  >
                    {product?.name ? (
                      product.name
                    ) : (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CircularProgress size={24} sx={{ mr: 1 }} />
                      </Box>
                    )}
                  </Typography>
                </Box>
              </Container>

              <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
                <Box sx={{ backgroundColor: '#333', color: '#fff', padding: 4, borderRadius: 2, flex: 1, mr: 2 }}>
                  <Typography variant="h4" sx={{ mb: 2 }}>
                    Product Analytics
                  </Typography>
                  <Paper sx={{ p: 2, mb: 2 }}>
                    <Typography variant="h5" sx={{ mb: 1 }}>Search Volume</Typography>
                    <SearchVolumeItem
                      country="Australia"
                      flagUrl="https://upload.wikimedia.org/wikipedia/en/b/b9/Flag_of_Australia.svg"
                      searchVolume={product?.search_volume_au}
                    />
                    <SearchVolumeItem
                      country="United States"
                      flagUrl="https://upload.wikimedia.org/wikipedia/en/a/a4/Flag_of_the_United_States.svg"
                      searchVolume={product?.search_volume_us}
                    />
                    <SearchVolumeItem
                      country="United Kingdom"
                      flagUrl="https://upload.wikimedia.org/wikipedia/en/a/ae/Flag_of_the_United_Kingdom.svg"
                      searchVolume={product?.search_volume_uk}
                    />
                  </Paper>
                  {!keywords.length ? (
                    <LoadingState variant="inline" text="Loading keywords..." />
                  ) : (
                    <KeywordsList keywords={keywords} scores={sampleScores} />
                  )}
                </Box>

                <Box sx={{ backgroundColor: '#333', color: '#fff', padding: 4, borderRadius: 2, flex: 1, ml: 2 }}>
                  <Typography variant="h4" sx={{ mb: 2 }}>
                    Pricing and Listings
                  </Typography>
                  <Paper sx={{ p: 2, mb: 2 }}>
                    <Typography variant="h5" sx={{ mb: 1 }}>Average Pricing</Typography>
                      <Typography variant="h6">Ebay</Typography>
                      <InfoItem value={product ? convertPrice(product.average_ebay_price) : null} />
                  </Paper>
                  <Paper sx={{ p: 2 }}>
                    <InfoItem title="Ebay Sold Listings - 90 Days" value={product ? product.ebay_listings : null} />
                    <InfoItem title="Ebay Total Sold - 90 Days" value={product ? convertPrice(product.ebay_sale_amount) : null} />
                  </Paper>
                </Box>
              </Container>
            </>
          )}
        </Box>
      </EnhancedErrorBoundary>
    </ThemeProvider>
  );
}

export default ProductCard;