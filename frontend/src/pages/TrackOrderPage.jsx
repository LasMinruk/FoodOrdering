import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
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
  Stepper,
  Step,
  StepLabel
} from '@mui/material';

const TrackOrderPage = () => {
  const { orderId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [delivery, setDelivery] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const intervalRef = useRef(null);
  
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    if (!orderId) {
      setError("Order ID is missing");
      setLoading(false);
      return;
    }

    fetchOrderAndDelivery();

    // Set up polling for location updates
    intervalRef.current = setInterval(() => {
      if (delivery?.deliveryPersonId) {
        fetchDriverLocation(delivery.deliveryPersonId);
      }
    }, 30000); // Update every 30 seconds

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [orderId, currentUser, navigate]);

  const fetchOrderAndDelivery = async () => {
    try {
      setLoading(true);
      
      // Fetch order details
      const orderResponse = await axios.get(
        `http://localhost:5001/api/orders/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      setOrder(orderResponse.data);
      
      // Fetch delivery tracking info
      const deliveryResponse = await axios.get(
        `http://localhost:5010/api/delivery/track/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      setDelivery(deliveryResponse.data);
      
      // If we have a delivery person ID, fetch their location
      if (deliveryResponse.data?.deliveryPersonId) {
        fetchDriverLocation(deliveryResponse.data.deliveryPersonId);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching tracking data:', err);
      setError('Failed to load tracking information. Please try again.');
      setLoading(false);
    }
  };

  const fetchDriverLocation = async (driverId) => {
    try {
      const locationResponse = await axios.get(
        `http://localhost:5009/api/location/${driverId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (locationResponse.data) {
        setLocation({
          latitude: locationResponse.data.latitude,
          longitude: locationResponse.data.longitude,
          updatedAt: locationResponse.data.updatedAt
        });
      }
    } catch (err) {
      console.error('Error fetching driver location:', err);
      // Don't set error state here as this is a background update
    }
  };

  const getStatusStep = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 0;
      case 'confirmed':
        return 1;
      case 'preparing':
        return 2;
      case 'ready_for_pickup':
        return 3;
      case 'picked_up':
        return 4;
      case 'delivered':
        return 5;
      default:
        return 0;
    }
  };

  const getDeliveryStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'Order Received';
      case 'confirmed':
        return 'Order Confirmed';
      case 'preparing':
        return 'Preparing Your Food';
      case 'ready_for_pickup':
        return 'Ready for Pickup';
      case 'picked_up':
        return 'On the Way';
      case 'delivered':
        return 'Delivered';
      default:
        return 'Processing';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'warning';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'info';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography>Loading tracking information...</Typography>
        </Paper>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="error" variant="h6" gutterBottom>{error}</Typography>
          <Button variant="contained" onClick={fetchOrderAndDelivery}>
            Try Again
          </Button>
        </Paper>
      </Container>
    );
  }

  // If order is completed or cancelled, show different UI
  if (order?.status === 'delivered' || order?.status === 'cancelled') {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            This order has been {order.status}.
          </Typography>
          <Typography variant="body1" paragraph>
            You can view all your past orders in your order history.
          </Typography>
          <Button 
            variant="contained"
            onClick={() => navigate('/orders')}
            sx={{ mt: 2 }}
          >
            Go to Order History
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">
            Track Order
          </Typography>
          <Chip 
            label={order?.status || 'Processing'} 
            color={getStatusColor(order?.status)}
          />
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Order Progress */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Order Status
          </Typography>
          <Stepper activeStep={getStatusStep(delivery?.status)} alternativeLabel>
            <Step>
              <StepLabel>Order Received</StepLabel>
            </Step>
            <Step>
              <StepLabel>Order Confirmed</StepLabel>
            </Step>
            <Step>
              <StepLabel>Preparing</StepLabel>
            </Step>
            <Step>
              <StepLabel>Ready for Pickup</StepLabel>
            </Step>
            <Step>
              <StepLabel>On the Way</StepLabel>
            </Step>
            <Step>
              <StepLabel>Delivered</StepLabel>
            </Step>
          </Stepper>
          <Typography sx={{ mt: 2, textAlign: 'center' }} variant="h6">
            {getDeliveryStatusText(delivery?.status)}
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Delivery Details */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Delivery Details
            </Typography>
            <Card variant="outlined">
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Delivery Address:
                    </Typography>
                    <Typography variant="body1">
                      {delivery?.deliveryAddress || 'Address not available'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Estimated Delivery Time:
                    </Typography>
                    <Typography variant="body1">
                      {delivery?.estimatedDeliveryTime || 'Calculating...'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Delivery Fee:
                    </Typography>
                    <Typography variant="body1">
                      Rs. {Number(delivery?.deliveryFee || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })} LKR
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Status Updated:
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(delivery?.updatedAt)}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Order #{order?._id?.substring(0, 8)}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  Restaurant: {order?.restaurantName || 'Not available'}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  Items: {order?.items?.length || 0}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="body1" fontWeight="bold">
                    Total
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    Rs. {Number(order?.totalAmount || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })} LKR
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Driver Location Section */}
        {delivery?.status === 'picked_up' && location && (
          <>
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Driver Location
              </Typography>
              <Card variant="outlined" sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Your driver is on the way! The driver's location was last updated at {formatDate(location.updatedAt)}.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  For privacy and security reasons, the exact location is not displayed on a map. 
                  The delivery person has been notified of your delivery address and will arrive shortly.
                </Typography>
              </Card>
            </Box>
          </>
        )}

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/orders')}
          >
            Back to Orders
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={fetchOrderAndDelivery}
          >
            Refresh Status
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default TrackOrderPage;