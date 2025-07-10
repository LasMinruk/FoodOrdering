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
  TextField,
  InputAdornment,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
  Tabs,
  Tab,
  Pagination
} from '@mui/material';
import {
  Search as SearchIcon,
  ListAlt,
  Pending,
  LocalShipping,
  CheckCircle,
  Cancel
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const OrdersPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const statusOptions = ['all', 'pending', 'confirmed', 'preparing', 'ready_for_pickup', 'picked_up', 'delivered', 'cancelled'];

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    fetchOrders();
  }, [currentUser, navigate, tabValue, page, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');

      let endpoint = '';
      if (currentUser.role === 'admin') {
        endpoint = 'http://localhost:5001/api/orders';
        if (statusFilter !== 'all') {
          endpoint = `http://localhost:5001/api/orders/status/${statusFilter}`;
        }
      } else if (currentUser.role === 'restaurant') {
        endpoint = `http://localhost:5001/api/orders/restaurant/${currentUser.restaurantId}`;
      } else {
        // Regular customer
        endpoint = `http://localhost:5001/api/orders/customer/${currentUser._id}`;
      }

      const response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Filter and sort orders based on tab and status
      let filteredOrders = response.data;
      
      // Filter by tab
      if (tabValue === 1) { // Active orders
        filteredOrders = filteredOrders.filter(order => 
          ['pending', 'confirmed', 'preparing', 'ready_for_pickup', 'picked_up'].includes(order.status?.toLowerCase())
        );
      } else if (tabValue === 2) { // Completed orders
        filteredOrders = filteredOrders.filter(order => 
          order.status?.toLowerCase() === 'delivered'
        );
      } else if (tabValue === 3) { // Cancelled orders
        filteredOrders = filteredOrders.filter(order => 
          order.status?.toLowerCase() === 'cancelled'
        );
      }

      // Filter by search term (order ID)
      if (searchTerm) {
        filteredOrders = filteredOrders.filter(order => 
          order._id.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Sort orders by date (newest first)
      filteredOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // Simple pagination
      const ordersPerPage = 5;
      setTotalPages(Math.ceil(filteredOrders.length / ordersPerPage));
      
      const startIndex = (page - 1) * ordersPerPage;
      const paginatedOrders = filteredOrders.slice(startIndex, startIndex + ordersPerPage);
      
      setOrders(paginatedOrders);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders');
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(1); // Reset page when changing tabs
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(1); // Reset page when changing search
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setPage(1); // Reset page when changing filter
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleViewOrder = (orderId) => {
    console.log('Navigating to /orders/' + orderId);
    navigate(`/orders/${orderId}`);
  };

  const handleTrackOrder = (orderId) => {
    navigate(`/track/${orderId}`);
    
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Orders
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, mb: 3, gap: 2 }}>
          <TextField
            placeholder="Search by Order ID..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearchChange}
            sx={{ width: { xs: '100%', sm: '300px' } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />
          
          <FormControl size="small" sx={{ width: { xs: '100%', sm: '200px' } }}>
            <InputLabel id="status-filter-label">Status</InputLabel>
            <Select
              labelId="status-filter-label"
              value={statusFilter}
              onChange={handleStatusFilterChange}
              label="Status"
            >
              {statusOptions.map((status) => (
                <MenuItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="orders tabs">
            <Tab icon={<ListAlt />} label="All Orders" />
            <Tab icon={<Pending />} label="Active" />
            <Tab icon={<CheckCircle />} label="Completed" />
            <Tab icon={<Cancel />} label="Cancelled" />
          </Tabs>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ textAlign: 'center', p: 3 }}>
            <Typography color="error" gutterBottom>{error}</Typography>
            <Button variant="contained" onClick={fetchOrders}>
              Try Again
            </Button>
          </Box>
        ) : orders.length === 0 ? (
          <Box sx={{ textAlign: 'center', p: 3 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No orders found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {tabValue === 0
                ? "You haven't placed any orders yet."
                : tabValue === 1
                ? "You don't have any active orders."
                : tabValue === 2
                ? "You don't have any completed orders."
                : "You don't have any cancelled orders."}
            </Typography>
            {tabValue === 0 && (
              <Button
                variant="contained"
                sx={{ mt: 2 }}
                onClick={() => navigate('/restaurants')}
              >
                Browse Restaurants
              </Button>
            )}
          </Box>
        ) : (
          <Grid container spacing={3}>
            {orders.map((order) => (
              <Grid item xs={12} key={order._id}>
                <Card variant="outlined">
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={8}>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="h6">
                              Order #{order._id.substring(order._id.length - 6)}
                            </Typography>
                            <Chip 
                              label={order.status || 'Pending'}
                              color={getStatusColor(order.status)}
                              size="small"
                            />
                          </Box>
                          
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Placed on {formatDate(order.createdAt)}
                          </Typography>
                          
                          <Divider sx={{ my: 1 }} />
                          
                          {order.items?.slice(0, 3).map((item, index) => (
                            <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', my: 0.5 }}>
                              <Typography variant="body2">
                                {item.name} x {item.quantity}
                              </Typography>
                              <Typography variant="body2">
                                Rs. {(item.price * item.quantity).toFixed(2)}
                              </Typography>
                            </Box>
                          ))}
                          
                          {order.items?.length > 3 && (
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                              +{order.items.length - 3} more items
                            </Typography>
                          )}
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} sm={4}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                          <Box>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Total Amount:
                            </Typography>
                            <Typography variant="h6">
                              Rs. {order.totalAmount?.toFixed(2)}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
                            {['pending', 'confirmed', 'preparing', 'ready_for_pickup', 'picked_up'].includes(order.status?.toLowerCase()) && (
                              <Button 
                                variant="outlined"
                                color="primary"
                                size="small"
                                startIcon={<LocalShipping />}
                                onClick={() => handleTrackOrder(order._id)}
                              >
                                Track Order
                              </Button>
                            )}
                            
                            <Button 
                              variant="contained"
                              size="small"
                              onClick={() => handleViewOrder(order._id)}
                            >
                              View Details
                            </Button>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
        
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination 
              count={totalPages} 
              page={page} 
              onChange={handlePageChange} 
              color="primary" 
            />
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default OrdersPage;