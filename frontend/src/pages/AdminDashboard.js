import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Container, Typography, Box } from '@mui/material';
import { createProduct, deleteProduct, scrapeProducts, scrapeProduct } from '../services/api';
import ProductForm from '../components/ProductForm';
import ProductList from '../components/ProductList';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);

    useEffect(() => {
        fetchProducts();
    }, []);

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
    

    return (
        <Container>
            <Box display="flex" flexDirection="column" alignItems="center">
                <Typography variant="h2" component="h1" gutterBottom>
                    Admin Dashboard
                </Typography>
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
        </Container>
    );
};

export default AdminDashboard;