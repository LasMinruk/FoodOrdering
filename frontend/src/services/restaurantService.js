import axios from 'axios';

const API_URL = 'http://localhost:5008/api/restaurant';

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

// Get all restaurants (with optional filters)
export const getAllRestaurants = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.location) params.append('location', filters.location);
    if (filters.cuisine) params.append('cuisine', filters.cuisine);
    if (filters.isAvailable !== undefined) params.append('isAvailable', filters.isAvailable);
    
    const response = await api.get('/', { params });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: 'Network Error' };
  }
};

// Get a single restaurant with menu
export const getRestaurantById = async (restaurantId) => {
  try {
    const response = await api.get(`/${restaurantId}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: 'Network Error' };
  }
};

// Create a restaurant (restaurant admin)
export const createRestaurant = async (restaurantData) => {
  try {
    const response = await api.post('/', restaurantData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: 'Network Error' };
  }
};

// Set restaurant availability
export const setRestaurantAvailability = async (restaurantId, isAvailable) => {
  try {
    const response = await api.patch(`/${restaurantId}/availability`, { isAvailable });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: 'Network Error' };
  }
};

// Verify a restaurant (admin only)
export const verifyRestaurant = async (restaurantId) => {
  try {
    const response = await api.patch(`/${restaurantId}/verify`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: 'Network Error' };
  }
};

// Menu operations
export const addMenuItem = async (restaurantId, menuItemData) => {
  try {
    const response = await api.post(`/${restaurantId}/menu`, menuItemData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: 'Network Error' };
  }
};

export const updateMenuItem = async (restaurantId, menuId, menuItemData) => {
  try {
    const response = await api.put(`/${restaurantId}/menu/${menuId}`, menuItemData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: 'Network Error' };
  }
};

export const deleteMenuItem = async (restaurantId, menuId) => {
  try {
    const response = await api.delete(`/${restaurantId}/menu/${menuId}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: 'Network Error' };
  }
};

export default {
  getAllRestaurants,
  getRestaurantById,
  createRestaurant,
  setRestaurantAvailability,
  verifyRestaurant,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem
};