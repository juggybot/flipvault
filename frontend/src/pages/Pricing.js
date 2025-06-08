import React, { useEffect, useState } from 'react';
import { Container, Typography, Grid, Paper, Button, Box, AppBar, Toolbar, IconButton, Menu, MenuItem, CssBaseline, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    if (!window.Stripe) {
      const stripeScript = document.createElement('script');
      stripeScript.src = 'https://js.stripe.com/v3/';
      stripeScript.async = true;
      document.body.appendChild(stripeScript);

      stripeScript.onload = () => {
        console.log('Stripe.js loaded successfully');
        initializeStripe();
      };

      stripeScript.onerror = () => {
        console.error('Failed to load Stripe.js');
        setError('Failed to load Stripe.js');
      };
    } else {
      initializeStripe();
    }
  }, []);

  const initializeStripe = () => {
    const stripePublicKey = process.env.REACT_APP_STRIPE_ENVIRONMENT === 'test'
      ? process.env.REACT_APP_STRIPE_TEST_PUBLIC_KEY
      : process.env.REACT_APP_STRIPE_PUBLIC_KEY;

    if (!stripePublicKey) {
      setError('Stripe public key is not configured.');
      return;
    }

    const stripe = window.Stripe(stripePublicKey);
    setStripeInstance(stripe);
  };

  const handleCheckout = async (plan) => {
    setLoading(true);
    setError(null);

    try {
      if (!stripeInstance) {
        throw new Error('Stripe instance is not initialized.');
      }

      const priceIds = {
        'pro-lite': process.env.REACT_APP_STRIPE_PRICE_PRO_LITE,
        'pro': process.env.REACT_APP_STRIPE_PRICE_PRO,
        'exclusive': process.env.REACT_APP_STRIPE_PRICE_EXCLUSIVE
      };

      if (!priceIds[plan]) {
        throw new Error('Invalid plan selected');
      }

      const { error: checkoutError } = await stripeInstance.redirectToCheckout({
        lineItems: [{ price: priceIds[plan], quantity: 1 }],
        mode: 'subscription',
        successUrl: window.location.origin + '/',
        cancelUrl: window.location.origin + '/',
      });

      if (checkoutError) throw checkoutError;
    } catch (err) {
      setError('Payment initialization failed. Please try again.');
      console.error('Checkout error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update button rendering:
  const PricingButton = ({ plan }) => (
    <ModernButton
      variant="contained"
      color="primary"
      onClick={() => handleCheckout(plan)}
    >
      BUY NOW
    </ModernButton>
  );

  // Add error display
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
              <PricingButton plan="pro-lite" />
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
              <PricingButton plan="pro" />
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
              <PricingButton plan="exclusive" />
            </Paper>
          </Grid>
        </Grid>

        {/* Feature Comparison */}
        <Box sx={{ mt: 8, mb: 8 }}>
          <Typography variant="h4" gutterBottom>Feature Comparison</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Feature</TableCell>
                  <TableCell>PRO LITE</TableCell>
                  <TableCell>PRO</TableCell>
                  <TableCell>EXCLUSIVE</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Product Checks</TableCell>
                  <TableCell>200/month</TableCell>
                  <TableCell>500/month</TableCell>
                  <TableCell>Unlimited</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Discord Alerts</TableCell>
                  <TableCell>3/week</TableCell>
                  <TableCell>10/week</TableCell>
                  <TableCell>Unlimited</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Market Analysis</TableCell>
                  <TableCell>Basic</TableCell>
                  <TableCell>Advanced</TableCell>
                  <TableCell>Premium</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Testimonials */}
        <Box sx={{ mt: 8 }}>
          <Typography variant="h4" gutterBottom>What Our Users Say</Typography>
          <Grid container spacing={4}>
            {/*
              Testimonials data can be fetched from an API or defined here statically
            */}
            {[
              {
                text: "Although FlipVault is my own product, I genuinely believe it has revolutionized the way I approach reselling.",
                author: "Juggy Resells",
                role: "Reselling Mentor"
              },
              {
                text: "FlipVault is helpful when I expand into a load of different products.",
                author: "Impact",
                role: "Exclusive Member"
              },
              {
                text: "Been teasing us with FlipVault, so keen for the drop",
                author: "Swiggy Resells",
                role: "Exclusive Member"
              }
            ].map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Paper sx={{ p: 3, height: '100%', bgcolor: 'background.paper' }}>
                  <Typography variant="body1" paragraph>"{testimonial.text}"</Typography>
                  <Typography variant="subtitle1" color="primary">{testimonial.author}</Typography>
                  <Typography variant="body2" color="text.secondary">{testimonial.role}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
      </Container>
    </ThemeProvider>
  );
}

export default Pricing;