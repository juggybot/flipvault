import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Box, Button, TextField, CircularProgress, Tabs, Tab, Paper,
} from '@mui/material';
import { createTheme, ThemeProvider, useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { createProduct, deleteProduct, scrapeProducts, scrapeProduct, updateUserPlanAdmin } from '../services/api';
import { styled } from '@mui/system';
import ProductForm from '../components/ProductForm';
import ProductList from '../components/ProductList';

const themeConfig = createTheme({
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

const AdminDashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAdminAuthenticated') === 'true';
  });
  const [credentials, setCredentials] = useState({ username: '', password: '' });

  useEffect(() => {
    if (isAuthenticated) {
      fetchProducts();
      fetchUsers();
    }
  }, [isAuthenticated]);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/admin-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password
        }),
      });

      if (!res.ok) throw new Error("Invalid login");

      localStorage.setItem("isAdminAuthenticated", "true");
      setIsAuthenticated(true);
    } catch (err) {
      alert("Login failed");
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa('juggy:Idus1234@@'),
        },
      });

      if (response.ok) {
        const data = await response.json();
        const processedUsers = Array.isArray(data)
          ? data.map((user) => ({
              ...user,
              plan: user.plan || localStorage.getItem(`user_${user.id}_plan`) || 'Free',
            }))
          : [];

        processedUsers.forEach((user) => {
          localStorage.setItem(`user_${user.id}_plan`, user.plan);
        });

        setUsers(processedUsers);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/products`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Fetch error:', error.message);
    }
  };

  const handleCreateProduct = async (product) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/products/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa('juggy:Idus1234@@'),
        },
        body: JSON.stringify({
          name: product.name,
          image_url: product.imageUrl,
        }),
      });

      if (!response.ok) throw new Error('Failed to create product');

      const newProduct = await response.json();
      setProducts([...products, newProduct]);
      alert('Product created successfully');
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Error creating product');
    }
  };

  const handleDeleteProduct = async (productId) => {
    await deleteProduct(productId);
    setProducts(products.filter((p) => p.id !== productId));
  };

  const handleScrapeProducts = async () => {
    const response = await scrapeProducts();
    alert(
      response.message === 'Scraper started in the background'
        ? 'Scraper started successfully'
        : 'Error starting scraper'
    );
  };

  const handleScrape = (id) => {
    scrapeProduct(id);
  };

  const handleSearch = async () => {
    setLoading(true);
    if (!query) {
      alert('Search query cannot be empty');
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/search/?query=${query}`
      );
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

  const handleDeleteUser = async (userId) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/users/${userId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Basic ' + btoa('juggy:Idus1234@@'),
          },
        }
      );

      if (response.ok) {
        setUsers(users.filter((user) => user.id !== userId));
        alert('User deleted successfully');
      } else {
        alert('Error deleting user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user');
    }
  };

  const handleUpdateUserPlan = async (userId, newPlan) => {
    try {
      const result = await updateUserPlanAdmin(userId, newPlan);
      if (result.success) {
        localStorage.setItem(`user_${userId}_plan`, newPlan);
        setUsers(
          users.map((user) =>
            user.id === userId
              ? { ...user, plan: newPlan, updated_at: new Date().toISOString() }
              : user
          )
        );
        alert('User plan updated successfully');
      } else {
        throw new Error(result.error || 'Failed to update plan');
      }
    } catch (error) {
      console.error('Error updating user plan:', error);
      alert(`Error updating user plan: ${error.message}`);
    }
  };

  if (!isAuthenticated) {
    return (
      <ThemeProvider theme={themeConfig}>
        <Container maxWidth="sm">
          <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h4" gutterBottom>
              Admin Login
            </Typography>
            <Box component="form" onSubmit={handleLogin} sx={{ mt: 1 }}>
              <TextField
                fullWidth
                label="Username"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                type="password"
                label="Password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                margin="normal"
                required
              />
              <Button fullWidth type="submit" variant="contained" sx={{ mt: 3, mb: 2 }}>
                Sign In
              </Button>
            </Box>
          </Box>
        </Container>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={themeConfig}>
      <Container>
        <Box display="flex" flexDirection="column" alignItems="center">
          <Typography variant="h2" gutterBottom>
            Admin Dashboard
          </Typography>

          <Tabs value={currentTab} onChange={(e, val) => setCurrentTab(val)}>
            <Tab label="Products" />
            <Tab label="Users" />
          </Tabs>

          {currentTab === 0 && (
            <Box sx={{ width: '100%', mt: 3 }}>
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
                  onKeyDown={handleKeyDown}
                  sx={{
                    mb: 2,
                    backgroundColor: '#444',
                    color: '#fff',
                    borderRadius: 1,
                    '& .MuiOutlinedInput-root': { color: '#fff' },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#555' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#777' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.primary.main,
                    },
                  }}
                />
                <ModernButton
                  variant="contained"
                  color="primary"
                  onClick={handleSearch}
                  disabled={loading}
                  sx={{ backgroundColor: '#1e88e5', '&:hover': { backgroundColor: '#1565c0' } }}
                >
                  {loading ? <CircularProgress size={24} /> : 'SEARCH'}
                </ModernButton>
              </Paper>

              <ProductForm onCreate={handleCreateProduct} />
              <Button
                variant="contained"
                color="primary"
                onClick={handleScrapeProducts}
                sx={{ mt: 3, mb: 3 }}
              >
                Run Scraper
              </Button>
              <ProductList products={products} onDelete={handleDeleteProduct} onScrape={handleScrape} />
            </Box>
          )}

          {currentTab === 1 && (
            <Box sx={{ width: '100%', mt: 3 }}>
              <Typography variant="h5" gutterBottom>
                Users
              </Typography>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #ddd' }}>
                            <th style={{ padding: '12px', textAlign: 'left' }}>ID</th>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Username</th>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Created At</th>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Plan</th>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} style={{ borderBottom: '1px solid #ddd' }}>
                                <td style={{ padding: '12px' }}>{user.id}</td>
                                <td style={{ padding: '12px' }}>{user.username}</td>
                                <td style={{ padding: '12px' }}>{new Date(user.created_at).toLocaleString()}</td>
                                <td style={{ padding: '12px' }}>
                                    <TextField
                                        select
                                        value={user.plan}
                                        onChange={(e) => handleUpdateUserPlan(user.id, e.target.value)}
                                        SelectProps={{
                                            native: true,
                                        }}
                                        variant="outlined"
                                        size="small"
                                    >
                                        <option value="Free">Free</option>
                                        <option value="Pro Lite">Pro Lite</option>
                                        <option value="Pro">Pro</option>
                                        <option value="Exclusive">Exclusive</option>
                                    </TextField>
                                </td>
                                <td style={{ padding: '12px' }}>
                                    <Button 
                                        size="small" 
                                        color="error"
                                        variant="contained"
                                        onClick={() => handleDeleteUser(user.id)}
                                    >
                                        Delete
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Box>
          )}
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default AdminDashboard;
