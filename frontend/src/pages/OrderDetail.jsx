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
  TextField,
  Rating
} from '@mui/material';
import { 
  LocalShipping, 
  Receipt, 
  Schedule, 
  Person, 
  Restaurant as RestaurantIcon,
  Star
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const OrderDetail = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [ratingSubmitting, setRatingSubmitting] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    if (id) {
      fetchOrderDetail();
    }
  }, [id, currentUser, navigate]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      setError('');
    
      const response = await axios.get(
        `http://localhost:5001/api/orders/customer/${currentUser._id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      setOrder(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching order details:', err);
      if (err.response) {
        console.error('Response error:', err.response);
        if (err.response.status === 403) {
          setError('You do not have permission to view this order.');
        } else if (err.response.status === 500) {
          setError('Internal Server Error. Please try again later.');
        } else {
          setError('Failed to load order details');
        }
      } else {
        setError('An unexpected error occurred');
      }
      setLoading(false);
    }
  };
  
  const handleTrackOrder = () => {
    navigate(`/track/${order._id}`);
  };

  const handleOpenRatingDialog = () => {
    setRatingDialogOpen(true);
    if (order.rating) {
      setRating(order.rating);
      setReview(order.review || '');
    } else {
      setRating(0);
      setReview('');
    }
  };

  const handleRatingSubmit = async () => {
    try {
      setRatingSubmitting(true);
      
      await axios.post(
        `http://localhost:5001/api/orders/${id}/rate`,
        { rating, review },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      // Update the local order state
      setOrder({
        ...order,
        rating,
        review
      });
      
      setRatingDialogOpen(false);
      setRatingSubmitting(false);
      
    } catch (err) {
      console.error('Error submitting rating:', err);
      setError('Failed to submit rating');
      setRatingSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const calculateSubtotal = () => {
    if (!order || !order.items) return 0;
  
    const subtotal = order.items.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);
  
    return isNaN(subtotal) ? 0 : subtotal;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'warning';
      case 'confirmed':
        return 'info';
      case 'preparing':
        return 'info';
      case 'ready_for_pickup':
        return 'info';  
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

  const getOrderId = () => {
    return order && order._id ? order._id.substring(order._id.length - 6) : 'N/A';
  };

  const formattedTotalAmount = order && order.totalAmount != null ? order.totalAmount.toFixed(2) : '0.00';

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5, mb: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="error" variant="h6" gutterBottom>
            {error}
          </Typography>
          <Button variant="contained" onClick={fetchOrderDetail}>
            Try Again
          </Button>
          <Button
            variant="outlined"
            sx={{ ml: 2 }}
            onClick={() => navigate('/orders')}
          >
            Back to Orders
          </Button>
        </Paper>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            Order not found
          </Typography>
          <Button
            variant="outlined"
            sx={{ mt: 2 }}
            onClick={() => navigate('/orders')}
          >
            Back to Orders
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Button
          startIcon={<Receipt />}
          variant="text"
          onClick={() => navigate('/orders')}
        >
          Back to Orders
        </Button>
        <Chip 
          label={order.status || 'Processing'} 
          color={getStatusColor(order.status)}
        />
      </Box>
      
      <Grid container spacing={3}>
        {/* Order Summary */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3, mb: { xs: 3, md: 0 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5">
                Order #{getOrderId()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Placed on {formatDate(order.createdAt)}
              </Typography>
            </Box>
            
            <Divider sx={{ mb: 3 }} />
            
            <Typography variant="h6" gutterBottom>
              Order Items
            </Typography>
            
            <Grid container sx={{ mb: 3 }}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Item
                </Typography>
              </Grid>
              <Grid item xs={2} sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Qty
                </Typography>
              </Grid>
              <Grid item xs={2} sx={{ textAlign: 'right' }}>
                <Typography variant="body2" color="text.secondary">
                  Price
                </Typography>
              </Grid>
              <Grid item xs={2} sx={{ textAlign: 'right' }}>
                <Typography variant="body2" color="text.secondary">
                  Total
                </Typography>
              </Grid>
            </Grid>
            
            {order.items && order.items.map((item, index) => (
              <Grid container key={index} sx={{ py: 1 }}>
                <Grid item xs={6}>
                  <Typography variant="body1">
                    {item.name}
                  </Typography>
                </Grid>
                <Grid item xs={2} sx={{ textAlign: 'center' }}>
                  <Typography variant="body1">
                    {item.quantity}
                  </Typography>
                </Grid>
                <Grid item xs={2} sx={{ textAlign: 'right' }}>
                  <Typography variant="body1">
                    ${item.price.toFixed(2)}
                  </Typography>
                </Grid>
                <Grid item xs={2} sx={{ textAlign: 'right' }}>
                  <Typography variant="body1">
                    ${(item.price * item.quantity).toFixed(2)}
                  </Typography>
                </Grid>
              </Grid>
            ))}
            
            <Divider sx={{ mt: 3, mb: 2 }} />
            
            <Grid container>
              <Grid item xs={8}>
                <Typography variant="body1">
                  Subtotal
                </Typography>
              </Grid>
              <Grid item xs={4} sx={{ textAlign: 'right' }}>
                <Typography variant="body1">
                  ${calculateSubtotal().toFixed(2)}
                </Typography>
              </Grid>
            </Grid>
            
            <Grid container sx={{ mt: 1 }}>
              <Grid item xs={8}>
                <Typography variant="body1">
                  Delivery Fee
                </Typography>
              </Grid>
              <Grid item xs={4} sx={{ textAlign: 'right' }}>
                <Typography variant="body1">
                  ${(order.deliveryFee || 0).toFixed(2)}
                </Typography>
              </Grid>
            </Grid>
            
            <Grid container sx={{ mt: 1 }}>
              <Grid item xs={8}>
                <Typography variant="body1">
                  Tax
                </Typography>
              </Grid>
              <Grid item xs={4} sx={{ textAlign: 'right' }}>
                <Typography variant="body1">
                  ${(order.tax || 0).toFixed(2)}
                </Typography>
              </Grid>
            </Grid>
            
            <Grid container sx={{ mt: 2 }}>
              <Grid item xs={8}>
                <Typography variant="h6">
                  Total
                </Typography>
              </Grid>
              <Grid item xs={4} sx={{ textAlign: 'right' }}>
                <Typography variant="h6">
                  ${formattedTotalAmount}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        {/* Order Info */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Order Information
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <RestaurantIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Restaurant
                </Typography>
                <Typography variant="body1">
                  {order.restaurantName || 'Restaurant Name'}
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Person sx={{ mr: 1, color: 'primary.main' }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Customer
                </Typography>
                <Typography variant="body1">
                  {order.customerName || currentUser.name}
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Schedule sx={{ mr: 1, color: 'primary.main' }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Delivery Time
                </Typography>
                <Typography variant="body1">
                  {order.estimatedDeliveryTime || 'As soon as possible'}
                </Typography>
              </Box>
            </Box>
          </Paper>
          
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Delivery Address
            </Typography>
            <Typography variant="body1">
              {order.deliveryAddress || currentUser.address && currentUser.address[0] ? 
                `${currentUser.address[0].addressLine1}, ${currentUser.address[0].addressLine2}, ${currentUser.address[0].homeTown}` : 
                'Address not available'}
            </Typography>
          </Paper>
          
          <Card sx={{ mb: 3 }}>
            <CardContent>
              {order.status === 'delivered' ? (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      Your Rating
                    </Typography>
                    {order.rating ? (
                      <Button 
                        size="small" 
                        startIcon={<Star />} 
                        onClick={handleOpenRatingDialog}
                      >
                        Edit
                      </Button>
                    ) : (
                      <Button 
                        variant="contained" 
                        size="small"
                        startIcon={<Star />}
                        onClick={handleOpenRatingDialog}
                      >
                        Rate Order
                      </Button>
                    )}
                  </Box>
                  
                  {order.rating ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Rating value={order.rating} readOnly precision={0.5} />
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {order.review || 'No review provided'}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      You haven't rated this order yet.
                    </Typography>
                  )}
                </Box>
              ) : (
                <Box>
                  {['pending', 'confirmed', 'preparing', 'ready_for_pickup', 'picked_up'].includes(order.status?.toLowerCase()) ? (
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<LocalShipping />}
                      onClick={handleTrackOrder}
                    >
                      Track Order
                    </Button>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                      This order has been {order.status || 'cancelled'}.
                    </Typography>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Rating Dialog */}
      <Dialog 
        open={ratingDialogOpen} 
        onClose={() => setRatingDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {order.rating ? 'Edit Your Rating' : 'Rate Your Order'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, mb: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography component="legend">Your Rating</Typography>
            <Rating
              name="order-rating"
              value={rating}
              onChange={(event, newValue) => {
                setRating(newValue);
              }}
              size="large"
              precision={0.5}
            />
          </Box>
          <TextField
            autoFocus
            margin="dense"
            id="review"
            label="Your Review (Optional)"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={4}
            value={review}
            onChange={(e) => setReview(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRatingDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleRatingSubmit} 
            variant="contained"
            disabled={ratingSubmitting || !rating}
          >
            {ratingSubmitting ? 'Submitting...' : 'Submit Rating'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default OrderDetail;