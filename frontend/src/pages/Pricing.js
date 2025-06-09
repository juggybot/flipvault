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
      main: '#64b5f6',
    },
    secondary: {
      main: '#f48fb1',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#e0e0e0',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
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
  const [stripeInstance, setStripeInstance] = useState(null);
  const [stripeReady, setStripeReady] = useState(false); // NEW LINE

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
    const stripePublicKey = process.env.REACT_APP_STRIPE_PUBLIC_KEY;

    if (!stripePublicKey) {
      console.error('Stripe public key not found:', process.env);
      setError('Stripe public key is not configured.');
      return;
    }

    try {
      const stripe = window.Stripe(stripePublicKey);
      setStripeInstance(stripe);
      setStripeReady(true);
    } catch (err) {
      console.error('Stripe initialization error:', err);
      setError('Failed to initialize Stripe');
    }
  };

  const handleCheckout = async (plan) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('https://flipvault.herokuapp.com/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Checkout error response:', errorData);
        throw new Error(errorData.detail || 'Failed to create checkout session');
      }

      const data = await response.json();
      console.log('Checkout session created:', data);

      if (!stripeInstance) {
        throw new Error('Stripe not initialized');
      }

      const { error } = await stripeInstance.redirectToCheckout({
        sessionId: data.sessionId,
      });

      if (error) {
        throw error;
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError('Payment initialization failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const PricingButton = ({ plan }) => (
    <ModernButton
      variant="contained"
      color="primary"
      disabled={loading || !stripeReady} // NEW LINE
      onClick={() => handleCheckout(plan)}
    >
      {loading ? 'Processing...' : 'BUY NOW'}
    </ModernButton>
  );

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
          {[
            { plan: 'pro-lite', name: 'PRO LITE', price: '$10 USD', period: 'Per 30 days', features: ['200 product checks monthly', 'Free vendors with every product check', '3 Discord product alerts a week'] },
            { plan: 'pro', name: 'PRO', price: '$17 USD', period: 'Per 30 days', features: ['500 product checks', 'Free vendors with every product', '10 Discord alerts weekly'] },
            { plan: 'exclusive', name: 'EXCLUSIVE', price: '$34 USD', period: 'Lifetime', features: ['Unlimited product checks', 'Free vendors with every product', 'Unlimited Discord alerts'] }
          ].map(({ plan, name, price, period, features }) => (
            <Grid item xs={12} md={4} key={plan}>
              <Paper sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 3 }}>
                <Typography variant="h5" sx={{ mb: 2 }}>{name}</Typography>
                <Typography variant="h4" sx={{ mb: 1 }}>{price}</Typography>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>{period}</Typography>
                <Box component="ul" sx={{ textAlign: 'left', pl: 3, mb: 3 }}>
                  {features.map((feature, i) => (
                    <li key={i}>{feature}</li>
                  ))}
                </Box>
                <PricingButton plan={plan} />
              </Paper>
            </Grid>
          ))}
        </Grid>

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

        <Box sx={{ mt: 8 }}>
          <Typography variant="h4" gutterBottom>What Our Users Say</Typography>
          <Grid container spacing={4}>
            {[
              { text: "Although FlipVault is my own product, I genuinely believe it has revolutionized the way I approach reselling.", author: "Juggy Resells", role: "Reselling Mentor" },
              { text: "FlipVault is helpful when I expand into a load of different products.", author: "Impact", role: "Exclusive Member" },
              { text: "Been teasing us with FlipVault, so keen for the drop", author: "Swiggy Resells", role: "Exclusive Member" }
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
