import React, { useState } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AppBar, Toolbar, CssBaseline, Typography, Paper, TextField, Button, Box } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { Menu as MenuIcon } from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { login } from '../services/api';
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

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [anchorEl, setAnchorEl] = React.useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    
    try {
      const result = await login(email, password);
      if (result.success) {
        localStorage.setItem('username', email);
        
        // Check if user has a free plan
        if (result.plan === 'Free') {
          setError('You are on a free plan. Please upgrade to access the dashboard.');
          return;
        }
        
        navigate('/user-dashboard');
      } else {
        setError('Invalid username or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please try again.');
    }
  };
  
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar
        position="static"
        elevation={0}
        sx={{
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <IconButton edge="start" color="inherit" aria-label="menu" onClick={handleMenuOpen}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, ml: 2, fontWeight: 'bold' }}>
            FlipVault
          </Typography>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Button color="inherit" component={Link} to="/login">
              Log in
            </Button>
          </Box>
        </Toolbar>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem component={Link} to="/" onClick={handleMenuClose}>Home</MenuItem>
          <MenuItem component={Link} to="/pricing" onClick={handleMenuClose}>Pricing</MenuItem>
          <MenuItem component={Link} to="/login" onClick={handleMenuClose}>Login</MenuItem>
        </Menu>
      </AppBar>
      <Paper
        style={{
          padding: '30px',
          maxWidth: '400px',
          margin: '100px auto',
          backgroundColor: '#2c2c2c',
          borderRadius: '12px',
        }}
      >
        <Typography variant="h6" gutterBottom style={{ textAlign: 'center', color: '#e0e0e0' }}>
          LOGIN TO YOUR ACCOUNT
        </Typography>
        {error && (
          <Typography 
            color="error" 
            sx={{ 
              mt: 2, 
              mb: 2, 
              textAlign: 'center',
              padding: '10px',
              backgroundColor: 'rgba(255, 0, 0, 0.1)',
              borderRadius: '4px'
            }}
          >
            {error}
            {error.includes('free plan') && (
              <Button
                component={Link}
                to="/pricing"
                color="primary"
                sx={{ 
                  display: 'block',
                  margin: '10px auto 0',
                  textTransform: 'none'
                }}
              >
                Upgrade Now
              </Button>
            )}
          </Typography>
        )}
        <form onSubmit={handleSubmit}>
          <TextField
            label="Username or Email"
            variant="outlined"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            InputProps={{
              style: { color: '#e0e0e0' }, // Text color
            }}
            InputLabelProps={{
              style: { color: '#9e9e9e' }, // Label color
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#616161', // Border color
                },
                '&:hover fieldset': {
                  borderColor: '#9e9e9e', // Hover border color
                },
                '&.Mui-focused fieldset': {
                  borderColor: theme.palette.primary.main, // Focused border color
                },
              },
            }}
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              style: { color: '#e0e0e0' }, // Text color
            }}
            InputLabelProps={{
              style: { color: '#9e9e9e' }, // Label color
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#616161', // Border color
                },
                '&:hover fieldset': {
                  borderColor: '#9e9e9e', // Hover border color
                },
                '&.Mui-focused fieldset': {
                  borderColor: theme.palette.primary.main, // Focused border color
                },
              },
            }}
          />
          <ModernButton
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            style={{ marginTop: '24px', padding: '12px', fontSize: '1rem' }} // Increased padding and font size
          >
            LOGIN
          </ModernButton>
        </form>
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            color="primary"
            component={Link}
            to="/register"
            sx={{ textTransform: 'none' }}
          >
            Create Account
          </Button>
          <Button
            color="primary"
            component={Link}
            to="/forgot-password"
            sx={{ textTransform: 'none' }}
          >
            Forgot Password?
          </Button>
        </Box>
      </Paper>
    </ThemeProvider>
  );
}

export default Login;