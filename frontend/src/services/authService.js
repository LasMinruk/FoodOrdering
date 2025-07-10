import axios from 'axios';

const API_URL = 'http://localhost:5007/api/auth';

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

// Register a new user
export const register = async (userData) => {
  try {
    const response = await api.post('/register', userData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: 'Network Error' };
  }
};

// Login user
export const login = async (email, password) => {
  try {
    const response = await api.post('/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: 'Network Error' };
  }
};

// Logout user
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Get current user
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/me');
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: 'Network Error' };
  }
};

// Update profile
export const updateProfile = async (profileData) => {
  try {
    const response = await api.put('/profile', profileData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: 'Network Error' };
  }
};

// Get favorite restaurants
export const getFavoriteRestaurants = async () => {
  try {
    const response = await api.get('/favorites');
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: 'Network Error' };
  }
};

// Add restaurant to favorites
export const addToFavorites = async (restaurantId) => {
  try {
    const response = await api.post('/favorites', { restaurantId });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: 'Network Error' };
  }
};

// Remove restaurant from favorites
export const removeFromFavorites = async (restaurantId) => {
  try {
    const response = await api.delete(`/favorites/${restaurantId}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: 'Network Error' };
  }
};

// Admin only: Get all users
export const getAllUsers = async () => {
  try {
    const response = await api.get('/users');
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: 'Network Error' };
  }
};

// Admin only: Block/Unblock a user
export const toggleUserStatus = async (userId, isActive) => {
  try {
    const response = await api.patch(`/users/${userId}/status`, { isActive });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: 'Network Error' };
  }
};

export default {
  register,
  login,
  logout,
  getCurrentUser,
  updateProfile,
  getFavoriteRestaurants,
  addToFavorites,
  removeFromFavorites,
  getAllUsers,
  toggleUserStatus
};