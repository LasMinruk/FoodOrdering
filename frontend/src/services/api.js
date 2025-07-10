import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  // If using Vite proxy, use relative URL, otherwise use full URL
  baseURL: '/api', // or you can use your actual API URL: 'http://localhost:5000/api'
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add a request interceptor to include auth token in all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common error cases
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      // You can redirect to login page here if needed
    }
    return Promise.reject(error);
  }
);

export default api;