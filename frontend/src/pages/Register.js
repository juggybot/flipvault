import React, { useState } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AppBar, Toolbar, CssBaseline, Typography, Paper, TextField, Button, Box } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { Menu as MenuIcon } from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
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

function sanitizeInput(input) {
  return input.trim();
}

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Sanitize inputs
    const cleanUsername = sanitizeInput(username);
    const cleanPassword = sanitizeInput(password);
    const cleanConfirmPassword = sanitizeInput(confirmPassword);

    // Validation
    if (cleanPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    if (cleanPassword !== cleanConfirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
      setError('Username can only contain letters, numbers, and underscores');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('https://flipvault-afea58153afb.herokuapp.com/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: cleanUsername,
          password: cleanPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        navigate('/login', { state: { message: 'Registration successful! Please log in.' } });
      } else {
        setError(data.detail || 'Registration failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
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
          CREATE YOUR ACCOUNT
        </Typography>
        {error && (
          <Typography color="error" sx={{ mb: 2, textAlign: 'center' }}>
            {error}
          </Typography>
        )}
        <form onSubmit={handleSubmit}>
          <TextField
            label="Username"
            variant="outlined"
            fullWidth
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            InputProps={{
              style: { color: '#e0e0e0' },
            }}
            InputLabelProps={{
              style: { color: '#9e9e9e' },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#616161',
                },
                '&:hover fieldset': {
                  borderColor: '#9e9e9e',
                },
                '&.Mui-focused fieldset': {
                  borderColor: theme.palette.primary.main,
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
              style: { color: '#e0e0e0' },
            }}
            InputLabelProps={{
              style: { color: '#9e9e9e' },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#616161',
                },
                '&:hover fieldset': {
                  borderColor: '#9e9e9e',
                },
                '&.Mui-focused fieldset': {
                  borderColor: theme.palette.primary.main,
                },
              },
            }}
          />
          <TextField
            label="Confirm Password"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            InputProps={{
              style: { color: '#e0e0e0' },
            }}
            InputLabelProps={{
              style: { color: '#9e9e9e' },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#616161',
                },
                '&:hover fieldset': {
                  borderColor: '#9e9e9e',
                },
                '&.Mui-focused fieldset': {
                  borderColor: theme.palette.primary.main,
                },
              },
            }}
          />
          <ModernButton
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading}
            style={{ marginTop: '24px', padding: '12px', fontSize: '1rem' }}
          >
            {loading ? 'REGISTERING...' : 'REGISTER'}
          </ModernButton>
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#9e9e9e' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: theme.palette.primary.main, textDecoration: 'none' }}>
                Log in
              </Link>
            </Typography>
          </Box>
        </form>
      </Paper>
    </ThemeProvider>
  );
}

export default Register;
