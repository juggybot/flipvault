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
    if (response.data.success) {
      // Store user data immediately after successful login
      if (response.data.plan) {
        localStorage.setItem('userPlan', response.data.plan);
        localStorage.setItem('planStatus', response.data.plan.toLowerCase() !== 'free' ? 'PAID' : 'FREE');
      }
      localStorage.setItem('username', username);
    }
    return { 
      success: response.data.success,
      plan: response.data.plan || 'Free'
    };
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

// Simplified token refresh without redirect
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Instead of redirecting, return error for handling
        return Promise.reject(new Error('Session expired'));
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// Add this helper function at the top with other constants
const VALID_PLANS = ['Free', 'Pro Lite', 'Pro', 'Exclusive'];
const validatePlan = (plan) => VALID_PLANS.includes(plan);

// Simplified plan checking
export const requirePaidPlan = async () => {
    try {
        const planData = localStorage.getItem('planData');
        if (planData) {
            const data = JSON.parse(planData);
            // Check if plan data is fresh (less than 1 hour old)
            const isFresh = new Date(data.updatedAt) > new Date(Date.now() - 3600000);
            
            if (isFresh && validatePlan(data.plan)) {
                return data.status === 'PAID';
            }
        }

        // If no valid cached data, check with server
        const username = localStorage.getItem('username');
        if (username) {
            const response = await axiosInstance.get(`/user/plan/${username}`);
            if (response.data && response.data.plan) {
                const newPlanData = {
                    plan: response.data.plan,
                    updatedAt: new Date().toISOString(),
                    status: response.data.plan.toLowerCase() !== 'free' ? 'PAID' : 'FREE'
                };
                
                localStorage.setItem('userPlan', response.data.plan);
                localStorage.setItem('planStatus', newPlanData.status);
                localStorage.setItem('planData', JSON.stringify(newPlanData));
                
                return newPlanData.status === 'PAID';
            }
        }
        
        return false;
    } catch (error) {
        console.error('Error checking plan:', error);
        // Fallback to stored plan on error
        const planData = localStorage.getItem('planData');
        return planData ? JSON.parse(planData).status === 'PAID' : false;
    }
};

// Add this new function for admin plan updates
export const updateUserPlanAdmin = async (userId, newPlan) => {
    try {
        console.log('Updating plan:', { userId, newPlan });

        if (!validatePlan(newPlan)) {
            throw new Error(`Invalid plan type: ${newPlan}`);
        }

        if (!userId) {
            throw new Error('No user ID provided');
        }

        const payload = { 
            plan: newPlan,
            timestamp: new Date().toISOString()
        };

        const response = await axiosInstance.put(`/users/${userId}/plan`, payload);
        console.log('Server response:', response.data);

        if (!response.data) {
            throw new Error('No response data received');
        }

        // Store plan data in multiple locations for redundancy
        localStorage.setItem(`user_${userId}_plan`, newPlan);
        
        const planData = {
            plan: newPlan,
            updatedAt: new Date().toISOString(),
            status: newPlan.toLowerCase() !== 'free' ? 'PAID' : 'FREE',
            userId: userId
        };

        // Update current user plan if applicable
        const targetUsername = response.data.username;
        const currentUsername = localStorage.getItem('username');
        
        if (targetUsername === currentUsername) {
            localStorage.setItem('userPlan', newPlan);
            localStorage.setItem('planStatus', planData.status);
            localStorage.setItem('planData', JSON.stringify(planData));
        }

        return {
            success: true,
            data: { ...response.data, plan: newPlan }, // Include plan in response
            plan: newPlan,
            planData
        };
    } catch (error) {
        console.error('Plan update failed:', error);
        return { 
            success: false, 
            error: error.message || 'Error updating plan',
            code: error.response?.status,
            details: error.response?.data
        };
    }
};
