import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Divider,
  CircularProgress,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  TextField
} from '@mui/material';
import {
  Restaurant,
  MenuBook,
  LocalShipping,
  Analytics
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import RestaurantInfo from '../components/restaurant/RestaurantInfo';
import MenuManagement from '../components/restaurant/MenuManagement';
import RestaurantOrders from '../components/restaurant/RestaurantOrders';
import RestaurantStats from '../components/restaurant/RestaurantStats';

const RestaurantOwnerDashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is a restaurant owner
    if (!currentUser || currentUser.role !== 'restaurant') {
      navigate('/login');
      return;
    }

    fetchRestaurantData();
  }, [currentUser, navigate]);

  const fetchRestaurantData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch restaurant by owner ID
      const response = await axios.get(
        `http://localhost:5008/api/restaurant?ownerId=${currentUser._id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.length > 0) {
        // Get first restaurant (assuming one owner has one restaurant for now)
        const restaurantId = response.data[0]._id;
        
        // Fetch restaurant details with menu
        const detailsResponse = await axios.get(
          `http://localhost:5008/api/restaurant/${restaurantId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        
        setRestaurant(detailsResponse.data);
      } else {
        // No restaurant found for this owner
        setRestaurant(null);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching restaurant data:', err);
      setError('Failed to load restaurant information');
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleAvailabilityChange = async (event) => {
    if (!restaurant) return;
    
    const isAvailable = event.target.checked;
    
    try {
      await axios.patch(
        `http://localhost:5008/api/restaurant/${restaurant._id}/availability`,
        { isAvailable },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      setRestaurant(prev => ({
        ...prev,
        isAvailable
      }));
      
    } catch (err) {
      console.error('Error updating restaurant availability:', err);
      alert('Failed to update restaurant availability');
    }
  };

  const handleCreateRestaurant = () => {
    navigate('/create-restaurant');
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress />
      </Container>
    );
  }

  // If the restaurant owner doesn't have a restaurant yet
  if (!restaurant && !loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Welcome to Food Ordering System
          </Typography>
          <Typography variant="body1" paragraph>
            You don't have a restaurant set up yet. Create one to start managing your business.
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            size="large"
            onClick={handleCreateRestaurant}
            sx={{ mt: 2 }}
          >
            Create Restaurant
          </Button>
        </Paper>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color="error" variant="h6">{error}</Typography>
        <Button variant="contained" onClick={fetchRestaurantData}>
          Try Again
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4">
            {restaurant?.name || 'Restaurant Dashboard'}
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={restaurant?.isAvailable || false}
                onChange={handleAvailabilityChange}
                color="primary"
              />
            }
            label={restaurant?.isAvailable ? "Open" : "Closed"}
          />
        </Box>
        
        <Divider sx={{ mb: 3 }} />

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="restaurant dashboard tabs">
            <Tab icon={<Restaurant />} label="Restaurant Info" />
            <Tab icon={<MenuBook />} label="Menu Management" />
            <Tab icon={<LocalShipping />} label="Orders" />
            <Tab icon={<Analytics />} label="Statistics" />
          </Tabs>
        </Box>

        {/* Restaurant Info Tab */}
        {tabValue === 0 && (
          <Box sx={{ py: 3 }}>
            <RestaurantInfo 
              restaurant={restaurant} 
              onUpdate={fetchRestaurantData} 
            />
          </Box>
        )}

        {/* Menu Management Tab */}
        {tabValue === 1 && (
          <Box sx={{ py: 3 }}>
            <MenuManagement 
              restaurant={restaurant} 
              onUpdate={fetchRestaurantData} 
            />
          </Box>
        )}

        {/* Orders Tab */}
        {tabValue === 2 && (
          <Box sx={{ py: 3 }}>
            <RestaurantOrders 
              restaurantId={restaurant?._id} 
            />
          </Box>
        )}

        {/* Statistics Tab */}
        {tabValue === 3 && (
          <Box sx={{ py: 3 }}>
            <RestaurantStats 
              restaurantId={restaurant?._id} 
            />
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default RestaurantOwnerDashboard;