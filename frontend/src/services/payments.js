import { axiosInstance } from './api';

export const createSubscription = async (planId) => {
  try {
    const response = await axiosInstance.post('/create-subscription', { planId });
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Subscription creation failed:', error);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to create subscription' 
    };
  }
};

export const cancelSubscription = async () => {
  try {
    const response = await axiosInstance.post('/cancel-subscription');
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Subscription cancellation failed:', error);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to cancel subscription' 
    };
  }
};
