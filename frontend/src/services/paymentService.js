import axios from 'axios';

const API_URL = 'http://localhost:5004/api/payments';

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

// Make a payment
export const createPayment = async (paymentData) => {
  try {
    const response = await api.post('/create', paymentData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: 'Network Error' };
  }
};

// Get payment history by user ID
export const getPaymentHistory = async (userId) => {
  try {
    const response = await api.get(`/history/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: 'Network Error' };
  }
};

// Get payment details by payment ID
export const getPaymentDetails = async (paymentId) => {
  try {
    const response = await api.get(`/${paymentId}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: 'Network Error' };
  }
};

// Confirm a payment
export const confirmPayment = async (paymentId) => {
  try {
    const response = await api.put(`/confirm/${paymentId}`, {
      message: 'Payment confirmed',
      payment: { status: 'completed' }
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: 'Network Error' };
  }
};

// Handle payment failure
export const handlePaymentFailure = async (paymentId, reason) => {
  try {
    const response = await api.put(`/failure/${paymentId}`, { reason });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: 'Network Error' };
  }
};

// Get admin dashboard statistics
export const getAdminPaymentStats = async () => {
  try {
    const response = await api.get('/stats/admin');
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: 'Network Error' };
  }
};

export default {
  createPayment,
  getPaymentHistory,
  getPaymentDetails,
  confirmPayment,
  handlePaymentFailure,
  getAdminPaymentStats
};