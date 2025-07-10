import axios from 'axios';

const API_URL = 'http://localhost:5010/api/delivery';

// Create axios instance with headers config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercept requests and add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Assign delivery (Manual)
export const assignDelivery = async (deliveryData) => {
  try {
    const response = await api.post('/assign', deliveryData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: 'Network Error' };
  }
};

// Get deliveries by delivery person ID
export const getDeliveriesByPerson = async (deliveryPersonId) => {
  try {
    const response = await api.get(`/driver/${deliveryPersonId}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: 'Network Error' };
  }
};

// Update delivery status
export const updateDeliveryStatus = async (deliveryId, status) => {
  try {
    const response = await api.put(`/status/${deliveryId}`, { status });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: 'Network Error' };
  }
};

// Get delivery by ID
export const getDeliveryById = async (deliveryId) => {
  try {
    const response = await api.get(`/${deliveryId}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: 'Network Error' };
  }
};

// Track delivery by order ID (for customers)
export const trackDeliveryByOrderId = async (orderId) => {
  try {
    const response = await api.get(`/track/${orderId}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: 'Network Error' };
  }
};

// Get active deliveries for a delivery person
export const getActiveDeliveriesForDriver = async (deliveryPersonId) => {
  try {
    const response = await api.get(`/active/driver/${deliveryPersonId}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: 'Network Error' };
  }
};

// Get all active deliveries (admin)
export const getAllActiveDeliveries = async () => {
  try {
    const response = await api.get('/active/all');
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: 'Network Error' };
  }
};

// Update delivery earnings
export const updateDeliveryEarnings = async (deliveryId, earningsData) => {
  try {
    const response = await api.put(`/earnings/${deliveryId}`, earningsData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: 'Network Error' };
  }
};

// Get delivery earnings history
export const getDeliveryEarnings = async (deliveryPersonId, startDate, endDate) => {
  try {
    let url = `/earnings/${deliveryPersonId}`;
    if (startDate && endDate) {
      url += `?startDate=${startDate}&endDate=${endDate}`;
    }
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: 'Network Error' };
  }
};

// Rate delivery
export const rateDelivery = async (deliveryId, ratingData) => {
  try {
    const response = await api.post(`/rate/${deliveryId}`, ratingData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: 'Network Error' };
  }
};

export default {
  assignDelivery,
  getDeliveriesByPerson,
  updateDeliveryStatus,
  getDeliveryById,
  trackDeliveryByOrderId,
  getActiveDeliveriesForDriver,
  getAllActiveDeliveries,
  updateDeliveryEarnings,
  getDeliveryEarnings,
  rateDelivery
};