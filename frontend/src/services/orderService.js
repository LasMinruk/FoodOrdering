import axios from 'axios';

const API_URL = 'http://localhost:5001/api/orders';

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

// Create a new order
export const createOrder = async (orderData) => {
  try {
    const response = await api.post('/', orderData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: 'Network Error' };
  }
};

// Get all orders (admin)
export const getAllOrders = async () => {
  try {
    const response = await api.get('/');
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: 'Network Error' };
  }
};

// Get order by ID
export const getOrderById = async (orderId) => {
  try {
    const response = await api.get(`/${orderId}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: 'Network Error' };
  }
};

// Update order by customer
export const updateOrderByCustomer = async (orderId, orderData) => {
  try {
    const response = await api.put(`/customer/${orderId}`, orderData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: 'Network Error' };
  }
};

// Update order status (admin or restaurant admin)
export const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await api.put(`/${orderId}`, { status });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: 'Network Error' };
  }
};

// Delete an order
export const deleteOrder = async (orderId) => {
  try {
    const response = await api.delete(`/${orderId}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: 'Network Error' };
  }
};

// Get orders by customer ID
export const getOrdersByCustomerId = async (customerId) => {
  try {
    const response = await api.get(`/customer/${customerId}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: 'Network Error' };
  }
};

// Get orders by status
export const getOrdersByStatus = async (status) => {
  try {
    const response = await api.get(`/status/${status}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: 'Network Error' };
  }
};

// Get orders by restaurant ID
export const getOrdersByRestaurantId = async (restaurantId) => {
  try {
    const response = await api.get(`/restaurant/${restaurantId}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: 'Network Error' };
  }
};

// Get restaurant order stats
export const getRestaurantOrderStats = async (restaurantId) => {
  try {
    const response = await api.get(`/stats/${restaurantId}`);
    console.log('Restaurant Order Stats:', response.data);  
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: 'Network Error' };
  }
};

// Rate an order
export const rateOrder = async (orderId, ratingData) => {
  try {
    const response = await api.post(`/${orderId}/rate`, ratingData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: 'Network Error' };
  }
};

// Get all order stats (admin)
export const getAllOrderStats = async () => {
  try {
    const response = await api.get('/admin/stats');
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: 'Network Error' };
  }
};

export default {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderByCustomer,
  updateOrderStatus,
  deleteOrder,
  getOrdersByCustomerId,
  getOrdersByStatus,
  getOrdersByRestaurantId,
  getRestaurantOrderStats,
  rateOrder,
  getAllOrderStats
};