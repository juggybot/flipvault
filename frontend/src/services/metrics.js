import { axiosInstance } from './api';

export const getUserMetrics = async () => {
  try {
    const response = await axiosInstance.get('/user/metrics');
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return { success: false, error: 'Failed to fetch metrics' };
  }
};

export const getProductAlerts = async () => {
  try {
    const response = await axiosInstance.get('/user/alerts');
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return { success: false, error: 'Failed to fetch alerts' };
  }
};
