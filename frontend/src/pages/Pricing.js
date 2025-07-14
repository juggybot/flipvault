import React, { useEffect, useState, useRef } from 'react';
import { Container, Typography, Grid, Paper, Button, Box, AppBar, Toolbar, IconButton, Menu, MenuItem, CssBaseline, TextField } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
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
  const [username, setUsername] = useState("");
  const [manualUsername, setManualUsername] = useState("");
  const [showUsernameInput, setShowUsernameInput] = useState(false);
  const lastPlanRef = React.useRef(null);

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

  useEffect(() => {
    // Try to get username from localStorage (if user is logged in)
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed.username) setUsername(parsed.username);
      } catch {}
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
    lastPlanRef.current = plan;

    // If not logged in, require username input
    if (!username && !manualUsername) {
      setShowUsernameInput(true);
      setLoading(false);
      setError("Please enter your FlipVault username to continue.");
      return;
    }

    try {
      const response = await fetch('https://flipvault-afea58153afb.herokuapp.com/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan, username: username || manualUsername }),
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
            { plan: 'pro-lite', name: 'PRO LITE', price: '$10 USD', period: 'Per 7 days' },
            { plan: 'pro', name: 'PRO', price: '$17 USD', period: 'Per 30 days' },
            { plan: 'exclusive', name: 'EXCLUSIVE', price: '$34 USD', period: 'Lifetime' }
          ].map(({ plan, name, price, period }) => (
            <Grid item xs={12} md={4} key={plan}>
              <Paper sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 3 }}>
                <Typography variant="h5" sx={{ mb: 2 }}>{name}</Typography>
                <Typography variant="h4" sx={{ mb: 1 }}>{price}</Typography>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>{period}</Typography>
                <PricingButton plan={plan} />
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 8 }}>
          <Typography variant="h4" gutterBottom>What Our Users Say</Typography>
          <Grid container spacing={4}>
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
                <Paper
                  sx={{
                    p: 3,
                    height: '100%',
                    bgcolor: 'background.paper',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <Typography variant="body1" paragraph sx={{ flexGrow: 1 }}>
                    "{testimonial.text}"
                  </Typography>
                  <Box>
                    <Typography variant="subtitle1" color="primary">
                      {testimonial.author}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {testimonial.role}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Username input for users not logged in */}
        <Dialog open={showUsernameInput} onClose={() => setShowUsernameInput(false)}>
          <DialogTitle>Enter your FlipVault username</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Username"
              type="text"
              fullWidth
              variant="standard"
              value={manualUsername}
              onChange={(e) => setManualUsername(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowUsernameInput(false)}>Cancel</Button>
            <Button
              onClick={() => {
                setShowUsernameInput(false);
                setError(null);
                handleCheckout(lastPlanRef.current);
              }}
              disabled={!manualUsername}
            >
              Continue to Payment
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ThemeProvider>
  );
}
 
export default Pricing;
