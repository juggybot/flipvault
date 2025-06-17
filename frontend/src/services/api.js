import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Basic ' + btoa('juggy:Idus1234@@')
  },
  withCredentials: true
});

// Enhanced error handling
const handleError = (error, customMessage = 'Request failed') => {
  const errorMessage = error.response?.data?.message || error.message;
  const errorCode = error.response?.status;
  
  console.error(`${customMessage}:`, {
    message: errorMessage,
    code: errorCode,
    details: error.response?.data
  });

  return { 
    success: false, 
    error: errorMessage,
    code: errorCode 
  };
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

export const adminLogin = async (username, password) => {
  try {
    const response = await axiosInstance.post('/admin-login', { 
      username, 
      password 
    });
    if (response.data.success) {
      localStorage.setItem('isAdmin', 'true');
      localStorage.setItem('adminAuth', btoa(`${username}:${password}`));
    }
    return response.data;
  } catch (error) {
    console.error('Admin login error:', error);
    return { success: false, error: error.response?.data?.detail || 'Login failed' };
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
    const authHeader = localStorage.getItem('adminAuth');
    const config = {
      headers: { 
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/json'
      }
    };
    
    const response = await axiosInstance.post('/products/', {
      name: product.name,
      image_url: product.image_url
    }, config);
    
    if (response.data) {
      console.log('Product created:', response.data);
      return { success: true, data: response.data };
    } else {
      throw new Error('No data received from server');
    }
  } catch (error) {
    console.error('Error creating product:', error);
    return { 
      success: false, 
      error: error.response?.data?.detail || 'Error creating product'
    };
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

// Add token refresh interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        const refreshResult = await axiosInstance.post('/refresh-token');
        if (refreshResult.data?.token) {
          localStorage.setItem('token', refreshResult.data.token);
          error.config.headers['Authorization'] = `Bearer ${refreshResult.data.token}`;
          return axiosInstance(error.config);
        }
      } catch (refreshError) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Add subscription verification to API calls
export const verifySubscription = async () => {
  try {
    const response = await axiosInstance.get('/verify-subscription');
    return response.data.isActive;
  } catch (error) {
    return handleError(error, 'Subscription verification failed');
  }
};

export const checkUserPlan = async (username) => {
  try {
    const response = await axiosInstance.get(`/user/plan/${username}`);
    return response.data.plan;
  } catch (error) {
    console.error('Error checking user plan:', error);
    return 'free';
  }
};

// Update these plan management functions
export const updateUserPlan = async (userId, plan) => {
    try {
        const response = await axiosInstance.put(`/users/${userId}/plan`, { plan });
        if (response.data && response.data.success) {
            const planStatus = plan.toLowerCase() !== 'free' ? 'PAID' : 'FREE';
            localStorage.setItem('userPlan', planStatus);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error updating plan:', error);
        return false;
    }
};

export const requirePaidPlan = async () => {
    try {
        const config = {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            withCredentials: true
        };

        const response = await axiosInstance.get('/check-subscription', config);
        const data = response.data;
        
        if (data && data.plan) {
            // Store both the full plan name and the PAID/FREE status
            localStorage.setItem('userPlan', data.plan);
            localStorage.setItem('planStatus', data.plan.toLowerCase() !== 'free' ? 'PAID' : 'FREE');
            return data.plan.toLowerCase() !== 'free';
        }
        
        // Fallback to checking stored plan
        const storedPlan = localStorage.getItem('userPlan');
        return storedPlan ? storedPlan.toLowerCase() !== 'free' : false;
    } catch (error) {
        console.error('Error checking subscription:', error);
        // Fallback to stored plan on error
        const storedPlan = localStorage.getItem('userPlan');
        return storedPlan ? storedPlan.toLowerCase() !== 'free' : false;
    }
};

