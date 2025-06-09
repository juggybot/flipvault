import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { CssBaseline, createTheme, ThemeProvider } from '@mui/material';
import Products from './Products';
import Settings from './Settings';
import UserDashboard from './UserDashboard';
import LandingPage from './LandingPage';
import Pricing from './Pricing';
import Login from './Login';
import FeeCalculatorPage from './FeeCalculator';
import ProductCard from '../components/ProductCard';
import AdminDashboard from './AdminDashboard';
import AdminLogin from './AdminLogin'; 
import Register from './Register'; // Import Register component
import ProtectedRoute from '../components/ProtectedRoute';

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

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route 
          path="/user-dashboard" 
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          } 
          />
          <Route 
            path="/products" 
            element={
              <ProtectedRoute>
                <Products />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/fee-calculator" 
            element={
              <ProtectedRoute>
                <FeeCalculatorPage />
              </ProtectedRoute>
            }
          />
          <Route path="/settings" element={<Settings />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/productcard/:productId" element={<ProductCard />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/register" element={<Register />} /> {/* Add register route */}
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;