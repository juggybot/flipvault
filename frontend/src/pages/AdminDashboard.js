import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Container, Typography, Box, Tab, Tabs, TextField } from '@mui/material';
import { createProduct, deleteProduct, scrapeProducts, scrapeProduct } from '../services/api';
import ProductForm from '../components/ProductForm';
import ProductList from '../components/ProductList';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [users, setUsers] = useState([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false); // Changed to false initially
    const [currentTab, setCurrentTab] = useState(0);
    const [credentials, setCredentials] = useState({
        username: '',
        password: ''
    });

    useEffect(() => {
        // Only fetch data if authenticated
        if (isAuthenticated) {
            fetchProducts();
            fetchUsers();
        }
    }, [isAuthenticated]);

    const handleLogin = async (e) => {
        e.preventDefault();
        const adminUsername = process.env.REACT_APP_ADMIN_USERNAME;
        const adminPassword = process.env.REACT_APP_ADMIN_PASSWORD;
        if (credentials.username === adminUsername && credentials.password === adminPassword) {
            setIsAuthenticated(true);
        } else {
            alert('Invalid credentials');
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await fetch('https://flipvault-afea58153afb.herokuapp.com/users', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Basic ' + btoa('juggy:Idus1234@@')
                },
            });
            if (response.ok) {
                const data = await response.json();
                console.log('Fetched users:', data); // Debug log
                setUsers(Array.isArray(data) ? data : []);
            } else {
                console.error('Failed to fetch users:', response.status);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await fetch('https://flipvault-afea58153afb.herokuapp.com/products', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            const data = await response.json();
            setProducts(data);
        } catch (error) {
            console.error('Fetch error:', error.message);
        }
    };

    const handleCreateProduct = async (product) => {
        try {
            const response = await fetch('https://flipvault-afea58153afb.herokuapp.com/products/', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Basic ' + btoa('juggy:Idus1234@@')
                },
                body: JSON.stringify({
                    name: product.name,
                    image_url: product.imageUrl
                })
            });

            if (!response.ok) {
                throw new Error('Failed to create product');
            }

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
        setProducts(products.filter(product => product.id !== productId));
    };

    const handleScrapeProducts = async () => {
        const response = await scrapeProducts();
        if (response.message === "Scraper started in the background") {
            alert('Scraper started successfully');
        } else {
            alert('Error starting scraper');
        }
    };

    const handleScrape = (id) => {
        scrapeProduct(id);
    };

    const handleDeleteUser = async (userId) => {
        try {
            const response = await fetch(`https://flipvault-afea58153afb.herokuapp.com/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Basic ' + btoa('juggy:Idus1234@@')
                },
            });

            if (response.ok) {
                setUsers(users.filter(user => user.id !== userId));
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
            const response = await fetch(`https://flipvault-afea58153afb.herokuapp.com/users/${userId}/plan`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Basic ' + btoa('juggy:Idus1234@@')
                },
                body: JSON.stringify({ plan: newPlan })
            });

            if (response.ok) {
                const updatedUser = await response.json();
                // Update users list
                setUsers(users.map(user => user.id === userId ? updatedUser : user));
                // Update local storage for the affected user
                if (updatedUser.username === localStorage.getItem('username')) {
                    localStorage.setItem('userPlan', newPlan !== 'Free' ? 'PAID' : 'FREE');
                }
                alert('User plan updated successfully');
            } else {
                alert('Error updating user plan');
            }
        } catch (error) {
            console.error('Error updating user plan:', error);
            alert('Error updating user plan');
        }
    };

    if (!isAuthenticated) {
        return (
            <Container maxWidth="sm">
                <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Admin Login
                    </Typography>
                    <Box component="form" onSubmit={handleLogin} sx={{ mt: 1 }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Username"
                            name="username"
                            autoComplete="username"
                            autoFocus
                            value={credentials.username}
                            onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            autoComplete="current-password"
                            value={credentials.password}
                            onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                        >
                            Sign In
                        </Button>
                    </Box>
                </Box>
            </Container>
        );
    }

    return (
        <Container>
            <Box display="flex" flexDirection="column" alignItems="center">
                <Typography variant="h2" component="h1" gutterBottom>
                    Admin Dashboard
                </Typography>
                <Tabs value={currentTab} onChange={(e, newValue) => setCurrentTab(newValue)}>
                    <Tab label="Products" />
                    <Tab label="Users" />
                </Tabs>

                {currentTab === 0 && (
                    <Box sx={{ width: '100%', mt: 3 }}>
                        <ProductForm onCreate={handleCreateProduct} />
                        <Button 
                            variant="contained" 
                            color="primary" 
                            onClick={handleScrapeProducts} 
                            style={{ marginTop: '20px', marginBottom: '20px' }}
                        >
                            Run Scraper
                        </Button>
                        <ProductList products={products} onDelete={handleDeleteProduct} onScrape={handleScrape}/>
                    </Box>
                )}

                {currentTab === 1 && (
                    <Box sx={{ width: '100%', mt: 3 }}>
                        <Typography variant="h5" gutterBottom>Users</Typography>
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
                                                <option value="Pro">Pro Lite</option>
                                                <option value="Pro Plus">Pro</option>
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
    );
};

export default AdminDashboard;