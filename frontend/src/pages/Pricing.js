import React, { useEffect } from 'react';
import { Container, Typography, Grid, Paper, Button, Box, AppBar, Toolbar, IconButton, Menu, MenuItem, CssBaseline } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Menu as MenuIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { styled } from '@mui/system';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#64b5f6', // A slightly more modern blue
    },
    secondary: {
      main: '#f48fb1',
    },
    background: {
      default: '#121212', // Darker background
      paper: '#1e1e1e', // Darker paper
    },
    text: {
      primary: '#e0e0e0', // Lighter text
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif', // Use a more modern font
    h2: {
      fontWeight: 700,
      fontSize: '3rem',
    },
    h5: {
      fontWeight: 400,
      fontSize: '1.5rem',
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

function Pricing() {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    // Load Stripe.js on component mount
    if (!window.Stripe) {
      const stripeScript = document.createElement('script');
      stripeScript.src = 'https://js.stripe.com/v3/';
      stripeScript.async = true;
      document.body.appendChild(stripeScript);

      stripeScript.onload = () => {
        console.log('Stripe.js loaded successfully');
      };

      stripeScript.onerror = () => {
        console.error('Failed to load Stripe.js');
      };
    }
  }, []);

  const handleCheckout = async (plan) => {
    // Initialize Stripe with your public key
    const stripePublicKey = process.env.REACT_APP_STRIPE_ENVIRONMENT === 'test'
      ? process.env.REACT_APP_STRIPE_TEST_PUBLIC_KEY
      : 'pk_test_51Ne35tHB4FuKHL1p15L1LqAnf1v6Et7i3ppuPb1E1mnfGWEirsi5sHuapeqrFztV7B5THeFyxtduHOmCRYoFvyHd00spIOY1Oq';
    const stripe = window.Stripe(stripePublicKey);

    // Map your plans to their respective Stripe Price IDs
    const priceIds = {
      'pro-lite': 'price_1RHhUgHB4FuKHL1ppYIJhs8A', // Replace with your actual Price ID for Pro Lite
      'pro': 'price_1RHhUrHB4FuKHL1pbnAkQAsi',      // Replace with your actual Price ID for Pro
      'exclusive': 'price_1RHhV2HB4FuKHL1pOJXZ4dj7'   // Replace with your actual Price ID for Exclusive
    };

    if (!priceIds[plan]) {
      console.error('Invalid plan selected');
      return;
    }

    try {
      // Redirect to Stripe Checkout
      const { error } = await stripe.redirectToCheckout({
        lineItems: [{ price: priceIds[plan], quantity: 1 }],
        mode: 'subscription',
        successUrl: window.location.origin + '/success',
        cancelUrl: window.location.origin + '/cancel',
      });
      if (error) {
        console.error('Stripe checkout error:', error.message);
      }
    } catch (err) {
      console.error('Checkout error:', err);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: 'linear-gradient(90deg, rgba(0,0,0,0.7) 0%, rgba(50,50,50,0.7) 100%)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <IconButton edge="start" color="inherit" aria-label="menu" onClick={handleMenuOpen}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, ml: 2, fontWeight: 'bold' }}>
            FlipVault
          </Typography>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Button color="inherit" component={Link} to="/login">
              Log in
            </Button>
          </Box>
        </Toolbar>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem component={Link} to="/" onClick={handleMenuClose}>
            Home
          </MenuItem>
          <MenuItem component={Link} to="/pricing" onClick={handleMenuClose}>
            Pricing
          </MenuItem>
          <MenuItem component={Link} to="/login" onClick={handleMenuClose}>
            Login
          </MenuItem>
        </Menu>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h2" component="h1" gutterBottom>
          PRICING AND PLANS
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 3,
                bgcolor: 'background.paper',
                borderRadius: 2,
                boxShadow: 3,
              }}
            >
              <Typography variant="h5" sx={{ mb: 2 }}>
                PRO LITE
              </Typography>
              <Typography variant="h4" sx={{ mb: 1 }}>
                $10 USD
              </Typography>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Per 30 days
              </Typography>
              <Box component="ul" sx={{ textAlign: 'left', pl: 3, mb: 3 }}>
                <li>200 product checks monthly</li>
                <li>Free vendors with every product check</li>
                <li>3 Discord product alerts a week</li>
              </Box>
              <ModernButton
                variant="contained"
                color="primary"
                onClick={() => handleCheckout('pro-lite')}
              >
                BUY NOW
              </ModernButton>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 3,
                bgcolor: 'background.paper',
                borderRadius: 2,
                boxShadow: 3,
              }}
            >
              <Typography variant="h5" sx={{ mb: 2 }}>
                PRO
              </Typography>
              <Typography variant="h4" sx={{ mb: 1 }}>
                $17 USD
              </Typography>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Per 30 days
              </Typography>
              <Box component="ul" sx={{ textAlign: 'left', pl: 3, mb: 3 }}>
                <li>500 product checks</li>
                <li>Free vendors with every product</li>
                <li>10 Discord alerts weekly</li>
              </Box>
              <ModernButton
                variant="contained"
                color="primary"
                onClick={() => handleCheckout('pro')}
              >
                BUY NOW
              </ModernButton>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 3,
                bgcolor: 'background.paper',
                borderRadius: 2,
                boxShadow: 3,
              }}
            >
              <Typography variant="h5" sx={{ mb: 2 }}>
                EXCLUSIVE
              </Typography>
              <Typography variant="h4" sx={{ mb: 1 }}>
                $34 USD
              </Typography>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Lifetime
              </Typography>
              <Box component="ul" sx={{ textAlign: 'left', pl: 3, mb: 3 }}>
                <li>Unlimited product checks</li>
                <li>Free vendors with every product</li>
                <li>Unlimited Discord alerts</li>
              </Box>
              <ModernButton
                variant="contained"
                color="primary"
                onClick={() => handleCheckout('exclusive')}
              >
                BUY NOW
              </ModernButton>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </ThemeProvider>
  );
}

export default Pricing;