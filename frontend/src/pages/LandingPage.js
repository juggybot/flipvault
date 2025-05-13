import React from 'react';
import { Container, Typography, Button, AppBar, Toolbar, IconButton, Box, CssBaseline, Menu, MenuItem } from '@mui/material';
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

function LandingPage() {
  const [anchorEl, setAnchorEl] = React.useState(null);

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
      <Container maxWidth="lg" sx={{ mt: 5, textAlign: 'center' }}>
        <Typography variant="h2" component="h1" gutterBottom>
          THE EXCLUSIVE PLATFORM FOR RESELLERS
        </Typography>
        <Box mt={4}>
          <iframe
            width="560"
            height="315"
            src="https://www.youtube.com/embed/KuZBwUZrVvA"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{
              maxWidth: '100%',
              marginBottom: '30px',
              borderRadius: '12px',
            }}
          ></iframe>
        </Box>
        <ModernButton
          variant="contained"
          color="primary"
          size="large"
          component={Link}
          to="/pricing"
          sx={{ borderRadius: '8px' }}
        >
          GET ACCESS
        </ModernButton>
      </Container>
    </ThemeProvider>
  );
}

export default LandingPage;