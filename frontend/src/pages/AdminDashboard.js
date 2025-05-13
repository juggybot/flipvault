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
            const response = await fetch('http://localhost:8000/products?skip=0&limit=15', {
                credentials: 'include',
                headers: {
                    'Authorization': 'Basic ' + btoa('juggy:Idus1234@@'),
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Error: ${response.status} - ${errorData.detail}`);
            }

            const data = await response.json();
            setProducts(data);
        } catch (error) {
            console.error('Fetch error:', error.message);
        }
    };

    const handleCreateProduct = async (product) => {
        const newProduct = await createProduct({ name: product.name, image_url: product.imageUrl });
        if (newProduct) {
            setProducts([...products, newProduct]);
        } else {
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