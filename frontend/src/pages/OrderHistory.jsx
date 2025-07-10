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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Rating,
  TextField
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const OrderHistory = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ratingDialog, setRatingDialog] = useState({
    open: false,
    orderId: null,
    rating: 0,
    review: ''
  });

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    fetchOrders();
  }, [currentUser, navigate]);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5001/api/orders/customer/${currentUser._id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setOrders(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load order history');
      setLoading(false);
    }
  };

  const handleViewDetails = (orderId) => {
    navigate(`/order/${orderId}`);
  };

  const handleTrackOrder = (orderId) => {
    navigate(`/track-order/${orderId}`);
  };

  const openRatingDialog = (orderId) => {
    setRatingDialog({
      open: true,
      orderId,
      rating: 0,
      review: ''
    });
  };

  const handleRatingChange = (event, newValue) => {
    setRatingDialog(prev => ({
      ...prev,
      rating: newValue
    }));
  };

  const handleReviewChange = (event) => {
    setRatingDialog(prev => ({
      ...prev,
      review: event.target.value
    }));
  };

  const submitRating = async () => {
    try {
      await axios.post(
        `http://localhost:5001/api/orders/${ratingDialog.orderId}/rate`,
        {
          rating: ratingDialog.rating,
          review: ratingDialog.review
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      // Update the local orders state to reflect the rating
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === ratingDialog.orderId 
            ? { ...order, rating: ratingDialog.rating, review: ratingDialog.review } 
            : order
        )
      );
      
      setRatingDialog(prev => ({
        ...prev,
        open: false
      }));
      
    } catch (err) {
      console.error('Error submitting rating:', err);
      setError('Failed to submit rating');
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
      case 'processing':
        return 'info';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color="error" variant="h6">{error}</Typography>
        <Button variant="contained" onClick={fetchOrders}>
          Try Again
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Order History
        </Typography>
        
        {orders.length === 0 ? (
          <Box sx={{ my: 4, textAlign: 'center' }}>
            <Typography variant="h6">
              You haven't placed any orders yet.
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              sx={{ mt: 2 }}
              onClick={() => navigate('/restaurants')}
            >
              Browse Restaurants
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {orders.map((order) => (
              <Grid item xs={12} key={order._id}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6">
                        Order #{order._id.substring(order._id.length - 6)}
                      </Typography>
                      <Chip 
                        label={order.status || 'Processing'} 
                        color={getStatusColor(order.status)}
                        size="small"
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Placed on {formatDate(order.createdAt || new Date())}
                    </Typography>
                    
                    <Divider sx={{ my: 1.5 }} />
                    
                    <Typography variant="subtitle2">
                      Items:
                    </Typography>
                    {order.items?.map((item, index) => (
                      <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', my: 1 }}>
                        <Typography variant="body2">
                          {item.name} x {item.quantity}
                        </Typography>
                        <Typography variant="body2">
                          ${(item.price * item.quantity).toFixed(2)}
                        </Typography>
                      </Box>
                    ))}
                    
                    <Divider sx={{ my: 1.5 }} />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle1">
                        Total
                      </Typography>
                      <Typography variant="subtitle1">
                        ${order.totalAmount?.toFixed(2)}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                      {order.status === 'delivered' && !order.rating && (
                        <Button 
                          size="small" 
                          variant="outlined"
                          onClick={() => openRatingDialog(order._id)}
                        >
                          Rate Order
                        </Button>
                      )}
                      
                      {order.status !== 'delivered' && order.status !== 'cancelled' && (
                        <Button 
                          size="small" 
                          variant="outlined"
                          onClick={() => handleTrackOrder(order._id)}
                        >
                          Track Order
                        </Button>
                      )}
                      
                      <Button 
                        size="small" 
                        variant="contained"
                        onClick={() => handleViewDetails(order._id)}
                      >
                        View Details
                      </Button>
                    </Box>
                    
                    {order.rating && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2">Your Rating:</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Rating value={order.rating} readOnly />
                          <Typography variant="body2" sx={{ ml: 1 }}>
                            {order.review}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

      {/* Rating Dialog */}
      <Dialog open={ratingDialog.open} onClose={() => setRatingDialog(prev => ({ ...prev, open: false }))}>
        <DialogTitle>Rate Your Order</DialogTitle>
        <DialogContent>
          <Box sx={{ my: 2 }}>
            <Typography component="legend">Rating</Typography>
            <Rating
              name="order-rating"
              value={ratingDialog.rating}
              onChange={handleRatingChange}
              precision={0.5}
              size="large"
            />
          </Box>
          <TextField
            autoFocus
            margin="dense"
            id="review"
            label="Review (Optional)"
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={ratingDialog.review}
            onChange={handleReviewChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRatingDialog(prev => ({ ...prev, open: false }))}>
            Cancel
          </Button>
          <Button onClick={submitRating} variant="contained">
            Submit Rating
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default OrderHistory;