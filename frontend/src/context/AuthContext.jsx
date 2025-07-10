import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is logged in on app load
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setCurrentUser(null);
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }
      
      // Get current user info (api will automatically use token from interceptor)
      const response = await api.get('/auth/me');
      
      if (response.data) {
        setCurrentUser(response.data);
        setIsAuthenticated(true);
      } else {
        // If the token exists but API doesn't return user, token is invalid
        logout();
      }
    } catch (error) {
      console.error('Auth status check error:', error);
      // If 401 error or other auth error, clear invalid tokens
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        logout();
      }
      setError('Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/auth/register', userData);
      
      if (response.data.token) {
        // Store token
        localStorage.setItem('token', response.data.token);
        
        setCurrentUser(response.data.user);
        setIsAuthenticated(true);
        
        toast.success('Registration successful!');
        return { success: true };
      } else {
        toast.success('Registration successful! Please log in.');
        return { success: true, requireLogin: true };
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError(
        error.response?.data?.message || 
        'Registration failed. Please check your information and try again.'
      );
      toast.error(error.response?.data?.message || 'Registration failed');
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed'
      };
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/auth/login', {
        email,
        password
      });
      
      const { token, user } = response.data;
      
      // Store token
      localStorage.setItem('token', token);
      
      setCurrentUser(user);
      setIsAuthenticated(true);
      
      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      setError(
        error.response?.data?.message || 
        'Login failed. Please check your credentials.'
      );
      toast.error(error.response?.data?.message || 'Login failed');
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed'
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Remove token
    localStorage.removeItem('token');
    
    // Clear user data
    setCurrentUser(null);
    setIsAuthenticated(false);
    
    toast.success('You have been logged out');
  };

  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.put('/auth/update-profile', profileData);
      
      setCurrentUser(response.data.user);
      
      toast.success('Profile updated successfully!');
      return { success: true };
    } catch (error) {
      console.error('Profile update error:', error);
      setError(
        error.response?.data?.message || 
        'Profile update failed. Please try again.'
      );
      toast.error(error.response?.data?.message || 'Profile update failed');
      return {
        success: false,
        error: error.response?.data?.message || 'Profile update failed'
      };
    } finally {
      setLoading(false);
    }
  };

  // Rest of functions using api instead of axios
  const changePassword = async (currentPassword, newPassword) => {
    try {
      setLoading(true);
      setError(null);
      
      await api.post('/auth/change-password', {
        currentPassword,
        newPassword
      });
      
      toast.success('Password changed successfully!');
      return { success: true };
    } catch (error) {
      console.error('Password change error:', error);
      setError(
        error.response?.data?.message || 
        'Password change failed. Please check your current password.'
      );
      toast.error(error.response?.data?.message || 'Password change failed');
      return {
        success: false,
        error: error.response?.data?.message || 'Password change failed'
      };
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      setError(null);
      
      await api.post('/auth/forgot-password', { email });
      
      toast.success('Password reset link sent to your email!');
      return { success: true };
    } catch (error) {
      console.error('Forgot password error:', error);
      setError(
        error.response?.data?.message || 
        'Failed to send reset link. Please check your email.'
      );
      toast.error(error.response?.data?.message || 'Failed to send reset link');
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to send reset link'
      };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      setLoading(true);
      setError(null);
      
      await api.post(`/auth/reset-password/${token}`, {
        password: newPassword
      });
      
      toast.success('Password has been reset successfully!');
      return { success: true };
    } catch (error) {
      console.error('Reset password error:', error);
      setError(
        error.response?.data?.message || 
        'Password reset failed. The link may be invalid or expired.'
      );
      toast.error(error.response?.data?.message || 'Password reset failed');
      return {
        success: false,
        error: error.response?.data?.message || 'Password reset failed'
      };
    } finally {
      setLoading(false);
    }
  };

  // Check if user has a specific role
  const hasRole = (role) => {
    if (!currentUser || !currentUser.role) return false;
    return currentUser.role === role;
  };

  const value = {
    currentUser,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    hasRole,
    checkAuthStatus
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;