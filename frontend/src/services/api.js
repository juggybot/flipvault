import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const USERNAME = process.env.REACT_APP_USERNAME;
const PASSWORD = process.env.REACT_APP_PASSWORD;

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  auth: {
    username: USERNAME,
    password: PASSWORD,
  },
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function for handling errors
const handleError = (error, customMessage = 'Request failed') => {
  console.error(customMessage, error.response?.data || error.message);
  return { success: false, error: error.response?.data || error.message };
};

// Authenticated Login
export const login = async (username, password) => {
  try {
    const response = await axiosInstance.post('/login', { username, password });
    return { success: response.data.success };
  } catch (error) {
    return handleError(error, 'Login error');
  }
};

// Fetch all products
export const getProducts = async () => {
  try {
    const response = await axiosInstance.get('/products');
    return { success: true, data: response.data };
  } catch (error) {
    return handleError(error, 'Error fetching products');
  }
};

// Create a new product
export const createProduct = async (product) => {
  try {
    const response = await axiosInstance.post('/products/', product);
    return { success: true, data: response.data };
  } catch (error) {
    return handleError(error, 'Error creating product');
  }
};

// Delete a product
export const deleteProduct = async (productId) => {
  try {
    await axiosInstance.delete(`/products/${productId}/delete`);
    return { success: true };
  } catch (error) {
    return handleError(error, 'Error deleting product');
  }
};

// Start scraping all products
export const scrapeProducts = async () => {
  try {
    const response = await axiosInstance.post('/products/scrape');
    return { success: true, data: response.data };
  } catch (error) {
    return handleError(error, 'Error starting scraper');
  }
};

// Start scraping a single product
export const scrapeProduct = async (productId) => {
  try {
    const response = await axiosInstance.post(`/products/scrape/${productId}`);
    return { success: true, data: response.data };
  } catch (error) {
    return handleError(error, `Error scraping product ${productId}`);
  }
};

