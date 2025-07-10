import axios from 'axios';

const API_URL = 'http://localhost:5007/api/auth/favorites'; 

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Get all favorite restaurants
export const getFavoriteRestaurants = async () => {
  try {
    const response = await api.get('/');
    return response.data; 
  } catch (error) {
    throw error.response ? error.response.data : { message: 'Network Error' };
  }
};

// Add a restaurant to favorites
export const addToFavorites = async (restaurantId) => {
  try {
    const response = await api.post('/', { restaurantId });
    return response.data; 
  } catch (error) {
    throw error.response ? error.response.data : { message: 'Network Error' };
  }
};

// Remove a restaurant from favorites
export const removeFromFavorites = async (restaurantId) => {
  try {
    const response = await api.delete(`/${restaurantId}`);
    return response.data; 
  } catch (error) {
    throw error.response ? error.response.data : { message: 'Network Error' };
  }
};

export default {
  getFavoriteRestaurants,
  addToFavorites,
  removeFromFavorites
};
