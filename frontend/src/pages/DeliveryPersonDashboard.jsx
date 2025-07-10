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
  LocalShipping,
  History,
  Payment,
  LocationOn
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const DeliveryPersonDashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [activeDeliveries, setActiveDeliveries] = useState([]);
  const [deliveryHistory, setDeliveryHistory] = useState([]);
  const [earnings, setEarnings] = useState({
    today: 0,
    week: 0,
    month: 0,
    total: 0
  });
  const [isAvailable, setIsAvailable] = useState(true);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState({
    active: true,
    history: true,
    earnings: true
  });
  const [error, setError] = useState({
    active: '',
    history: '',
    earnings: ''
  });
  const [showLocationUpdate, setShowLocationUpdate] = useState(false);
  const [locationInput, setLocationInput] = useState({
    latitude: '',
    longitude: ''
  });

  useEffect(() => {
    // Check if user is a delivery person
    if (!currentUser || currentUser.role !== 'delivery') {
      navigate('/login');
      return;
    }

    // Fetch initial data
    fetchActiveDeliveries();
    fetchDeliveryHistory();
    fetchEarnings();
    fetchCurrentLocation();

    // Set up location tracking interval
    const intervalId = setInterval(() => {
      // Only update if driver is available and has enabled location sharing
      if (isAvailable && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            updateDriverLocation(latitude, longitude);
          },
          (error) => {
            console.error("Error getting current position:", error);
          }
        );
      }
    }, 300000); // Update every 5 minutes

    return () => clearInterval(intervalId);
  }, [currentUser, navigate, isAvailable]);

  const fetchActiveDeliveries = async () => {
    try {
      setLoading((prev) => ({ ...prev, active: true }));
      const response = await axios.get(
        `http://localhost:5010/api/delivery/active/driver/${currentUser._id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setActiveDeliveries(response.data);
      setLoading((prev) => ({ ...prev, active: false }));
    } catch (err) {
      console.error('Error fetching active deliveries:', err);
      setError((prev) => ({ ...prev, active: 'Failed to load active deliveries' }));
      setLoading((prev) => ({ ...prev, active: false }));
    }
  };

  const fetchDeliveryHistory = async () => {
    try {
      setLoading((prev) => ({ ...prev, history: true }));
      const response = await axios.get(
        `http://localhost:5010/api/delivery/driver/${currentUser._id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setDeliveryHistory(response.data.filter(delivery => 
        delivery.status === 'delivered' || delivery.status === 'cancelled'));
      setLoading((prev) => ({ ...prev, history: false }));
    } catch (err) {
      console.error('Error fetching delivery history:', err);
      setError((prev) => ({ ...prev, history: 'Failed to load delivery history' }));
      setLoading((prev) => ({ ...prev, history: false }));
    }
  };

  const fetchEarnings = async () => {
    try {
      setLoading((prev) => ({ ...prev, earnings: true }));
      
      // Get current date for calculating periods
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      
      const response = await axios.get(
        `http://localhost:5010/api/delivery/earnings/${currentUser._id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          params: {
            startDate: startOfMonth.toISOString().split('T')[0],
            endDate: today.toISOString().split('T')[0]
          }
        }
      );
      
      // Assuming the API returns all earnings with dates
      const earningsData = response.data;
      
      // Calculate different period earnings
      const todayEarnings = earningsData
        .filter(earning => new Date(earning.date).toDateString() === today.toDateString())
        .reduce((sum, item) => sum + item.amount, 0);
      
      const weekEarnings = earningsData
        .filter(earning => {
          const earningDate = new Date(earning.date);
          return earningDate >= startOfWeek && earningDate <= today;
        })
        .reduce((sum, item) => sum + item.amount, 0);
      
      const monthEarnings = earningsData
        .filter(earning => {
          const earningDate = new Date(earning.date);
          return earningDate >= startOfMonth && earningDate <= today;
        })
        .reduce((sum, item) => sum + item.amount, 0);
      
      const totalEarnings = earningsData.reduce((sum, item) => sum + item.amount, 0);
      
      setEarnings({
        today: todayEarnings,
        week: weekEarnings,
        month: monthEarnings,
        total: totalEarnings
      });
      
      setLoading((prev) => ({ ...prev, earnings: false }));
    } catch (err) {
      console.error('Error fetching earnings:', err);
      setError((prev) => ({ ...prev, earnings: 'Failed to load earnings' }));
      setLoading((prev) => ({ ...prev, earnings: false }));
    }
  };

  const fetchCurrentLocation = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5009/api/location/${currentUser._id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (response.data) {
        setLocation({
          latitude: response.data.latitude,
          longitude: response.data.longitude
        });
      }
    } catch (err) {
      console.error('Error fetching current location:', err);
      // Don't set error state as this is not critical
    }
  };

  const updateDriverLocation = async (latitude, longitude) => {
    try {
      await axios.post(
        'http://localhost:5009/api/location',
        {
          agentId: currentUser._id,
          latitude,
          longitude
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      setLocation({ latitude, longitude });
    } catch (err) {
      console.error('Error updating location:', err);
    }
  };

  const handleAvailabilityChange = (event) => {
    setIsAvailable(event.target.checked);
    // Here you could add an API call to update driver availability in the database
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleUpdateDeliveryStatus = async (deliveryId, newStatus) => {
    try {
      await axios.put(
        `http://localhost:5010/api/delivery/status/${deliveryId}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      // Refresh the active deliveries
      fetchActiveDeliveries();
      
      // If status is delivered or cancelled, also refresh history
      if (newStatus === 'delivered' || newStatus === 'cancelled') {
        fetchDeliveryHistory();
        fetchEarnings();
      }
    } catch (err) {
      console.error('Error updating delivery status:', err);
      alert('Failed to update delivery status');
    }
  };

  const handleManualLocationUpdate = () => {
    const { latitude, longitude } = locationInput;
    
    if (latitude && longitude) {
      updateDriverLocation(parseFloat(latitude), parseFloat(longitude));
      setShowLocationUpdate(false);
      setLocationInput({ latitude: '', longitude: '' });
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'warning';
      case 'picked_up':
        return 'info';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4">
            Delivery Dashboard
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={isAvailable}
                onChange={handleAvailabilityChange}
                color="primary"
              />
            }
            label={isAvailable ? "Available" : "Unavailable"}
          />
        </Box>
        
        {/* Current location */}
        <Card variant="outlined" sx={{ mb: 3, p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <LocationOn color="primary" sx={{ mr: 1 }} />
              <Typography variant="body1">
                {location 
                  ? `Current Location: ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
                  : "Location not available"
                }
              </Typography>
            </Box>
            <Button 
              variant="text"
              size="small"
              onClick={() => setShowLocationUpdate(!showLocationUpdate)}
            >
              {showLocationUpdate ? "Cancel" : "Update"}
            </Button>
          </Box>
          
          {showLocationUpdate && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={5}>
                  <TextField
                    fullWidth
                    label="Latitude"
                    type="number"
                    value={locationInput.latitude}
                    onChange={(e) => setLocationInput(prev => ({ ...prev, latitude: e.target.value }))}
                  />
                </Grid>
                <Grid item xs={12} sm={5}>
                  <TextField
                    fullWidth
                    label="Longitude"
                    type="number"
                    value={locationInput.longitude}
                    onChange={(e) => setLocationInput(prev => ({ ...prev, longitude: e.target.value }))}
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <Button 
                    variant="contained"
                    fullWidth
                    sx={{ height: '100%' }}
                    onClick={handleManualLocationUpdate}
                  >
                    Save
                  </Button>
                </Grid>
              </Grid>
            </Box>
          )}
        </Card>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="delivery dashboard tabs">
            <Tab icon={<LocalShipping />} label="Active Deliveries" />
            <Tab icon={<History />} label="Delivery History" />
            <Tab icon={<Payment />} label="Earnings" />
          </Tabs>
        </Box>

        {/* Active Deliveries Tab */}
        {tabValue === 0 && (
          <Box sx={{ py: 3 }}>
            <Typography variant="h6" gutterBottom>
              Active Deliveries
            </Typography>
            
            {loading.active ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : error.active ? (
              <Typography color="error">{error.active}</Typography>
            ) : activeDeliveries.length === 0 ? (
              <Box sx={{ textAlign: 'center', p: 3 }}>
                <Typography variant="body1">No active deliveries at the moment.</Typography>
                <Typography variant="body2" color="text.secondary">
                  New deliveries will appear here when assigned to you.
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {activeDeliveries.map((delivery) => (
                  <Grid item xs={12} key={delivery._id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                          <Typography variant="h6">
                            Order #{delivery.orderId.substring(delivery.orderId.length - 6)}
                          </Typography>
                          <Chip 
                            label={delivery.status || 'Pending'} 
                            color={getStatusColor(delivery.status)}
                            size="small"
                          />
                        </Box>
                        
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <Typography variant="body2" color="text.secondary">
                              Delivery Address:
                            </Typography>
                            <Typography variant="body1" gutterBottom>
                              {delivery.deliveryAddress}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Typography variant="body2" color="text.secondary">
                              Delivery Fee:
                            </Typography>
                            <Typography variant="body1" gutterBottom>
                              ${delivery.deliveryFee?.toFixed(2) || '0.00'}
                            </Typography>
                          </Grid>
                        </Grid>
                        
                        <Divider sx={{ my: 2 }} />
                        
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                          {delivery.status === 'pending' && (
                            <Button 
                              variant="contained"
                              color="primary"
                              onClick={() => handleUpdateDeliveryStatus(delivery._id, 'picked_up')}
                            >
                              Mark as Picked Up
                            </Button>
                          )}
                          {delivery.status === 'picked_up' && (
                            <Button 
                              variant="contained"
                              color="success"
                              onClick={() => handleUpdateDeliveryStatus(delivery._id, 'delivered')}
                            >
                              Mark as Delivered
                            </Button>
                          )}
                          <Button 
                            variant="outlined"
                            onClick={() => navigate(`/delivery/${delivery._id}`)}
                          >
                            View Details
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}

        {/* Delivery History Tab */}
        {tabValue === 1 && (
          <Box sx={{ py: 3 }}>
            <Typography variant="h6" gutterBottom>
              Delivery History
            </Typography>
            
            {loading.history ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : error.history ? (
              <Typography color="error">{error.history}</Typography>
            ) : deliveryHistory.length === 0 ? (
              <Box sx={{ textAlign: 'center', p: 3 }}>
                <Typography variant="body1">No delivery history available.</Typography>
                <Typography variant="body2" color="text.secondary">
                  Completed deliveries will appear here.
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {deliveryHistory.map((delivery) => (
                  <Grid item xs={12} md={6} key={delivery._id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="subtitle1">
                            Order #{delivery.orderId.substring(delivery.orderId.length - 6)}
                          </Typography>
                          <Chip 
                            label={delivery.status} 
                            color={getStatusColor(delivery.status)}
                            size="small"
                          />
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {formatDate(delivery.updatedAt)}
                        </Typography>
                        
                        <Typography variant="body2" noWrap>
                          Address: {delivery.deliveryAddress}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                          <Typography variant="body1">
                            Earnings: ${delivery.deliveryFee?.toFixed(2) || '0.00'}
                          </Typography>
                          <Button 
                            size="small"
                            variant="text"
                            onClick={() => navigate(`/delivery/${delivery._id}`)}
                          >
                            Details
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}

        {/* Earnings Tab */}
        {tabValue === 2 && (
          <Box sx={{ py: 3 }}>
            <Typography variant="h6" gutterBottom>
              Earnings
            </Typography>
            
            {loading.earnings ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : error.earnings ? (
              <Typography color="error">{error.earnings}</Typography>
            ) : (
              <Grid container spacing={3}>
                <Grid item xs={6} md={3}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" color="text.secondary">
                        Today
                      </Typography>
                      <Typography variant="h5">
                        ${earnings.today.toFixed(2)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" color="text.secondary">
                        This Week
                      </Typography>
                      <Typography variant="h5">
                        ${earnings.week.toFixed(2)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" color="text.secondary">
                        This Month
                      </Typography>
                      <Typography variant="h5">
                        ${earnings.month.toFixed(2)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" color="text.secondary">
                        Total
                      </Typography>
                      <Typography variant="h5">
                        ${earnings.total.toFixed(2)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" gutterBottom>
                    Earnings Details
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    For detailed earnings history and reports, contact support.
                  </Typography>
                </Grid>
              </Grid>
            )}
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default DeliveryPersonDashboard;