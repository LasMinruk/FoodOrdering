import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api'; // Use centralized API service
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

const ManageOrders = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [error, setError] = useState('');
  
  // Pagination & Filtering
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  
  // Order details & status update
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openOrderDialog, setOpenOrderDialog] = useState(false);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    // Don't proceed until auth is done loading
    if (authLoading) return;
    
    // Redirect if not authenticated or not a restaurant admin
    if (!currentUser || currentUser.role !== 'restaurant_admin') {
      navigate('/login');
      return;
    }
    
    fetchRestaurantData();
  }, [currentUser, authLoading, navigate]);

  useEffect(() => {
    if (restaurant) {
      fetchOrders();
    }
  }, [restaurant, filter]);

  const fetchRestaurantData = async () => {
    // Make sure currentUser exists before trying to access its properties
    if (!currentUser || !currentUser._id) return;
    
    try {
      // Use centralized API service instead of direct axios calls
      const restaurantResponse = await api.get(`/restaurant?ownerId=${currentUser._id}`);
      
      if (!restaurantResponse.data || restaurantResponse.data.length === 0) {
        setError('No restaurant found. Please create a restaurant first.');
        setLoading(false);
        return;
      }
      
      const userRestaurant = restaurantResponse.data[0]; // Assuming one restaurant per owner
      setRestaurant(userRestaurant);
    } catch (err) {
      console.error('Error fetching restaurant data:', err);
      setError('Failed to load restaurant data. Please try again later.');
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      let endpoint = `/orders/restaurant/${restaurant._id}`;
      
      if (filter !== 'all') {
        endpoint = `/orders/restaurant/${restaurant._id}/status/${filter}`;
      }
      
      const response = await api.get(endpoint);
      
      setOrders(response.data);
      console.log('Fetched orders:', response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders. Please try again later.');
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(0);
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setOpenOrderDialog(true);
  };

  const handleOpenStatusDialog = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setOpenStatusDialog(true);
  };

  const handleCloseDialogs = () => {
    setOpenOrderDialog(false);
    setOpenStatusDialog(false);
    setSelectedOrder(null);
  };

  const handleUpdateStatus = async () => {
    try {
      await api.put(`/orders/${selectedOrder._id}`, {
        status: newStatus
      });
      
      // Update local state
      setOrders(orders.map(order => 
        order._id === selectedOrder._id ? { ...order, status: newStatus } : order
      ));
      
      handleCloseDialogs();
    } catch (err) {
      console.error('Error updating order status:', err);
      setError('Failed to update order status. Please try again.');
    }
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

  const getNextAction = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return { 
          text: 'Confirm Order',
          status: 'Confirmed',
          icon: <CheckCircleIcon />,
          color: 'primary'
        };
      case 'confirmed':
        return { 
          text: 'Start Preparing',
          status: 'Preparing',
          icon: <PlayArrowIcon />,
          color: 'info'
        };
      case 'preparing':
        return { 
          text: 'Ready for Pickup',
          status: 'Ready_for_Pickup',
          icon: <LocalShippingIcon />,
          color: 'secondary'
        };
      default:
        return null;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const calculateTotal = (items) => {
    return items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  };

  // Filter orders based on search term
  const filteredOrders = orders.filter(order => {
    const searchTerm = search.toLowerCase();
    return (
      order._id.toLowerCase().includes(searchTerm) ||
      (order.customerName && order.customerName.toLowerCase().includes(searchTerm)) ||
      (order.deliveryAddress && order.deliveryAddress.toLowerCase().includes(searchTerm))
    );
  });

  if (loading && !restaurant) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading restaurant data...</Typography>
      </Container>
    );
  }

  if (error && error.includes('create a restaurant')) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="error" variant="h6" gutterBottom>{error}</Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => navigate('/create-restaurant')}
          >
            Create Restaurant
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {restaurant && (
        <>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Manage Orders
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              View and manage customer orders for {restaurant.name}
            </Typography>
            <Divider sx={{ my: 2 }} />
          </Box>
          
          <Paper sx={{ p: 3, mb: 4 }}>
            <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel id="filter-label">Filter by Status</InputLabel>
                  <Select
                    labelId="filter-label"
                    id="filter-select"
                    value={filter}
                    label="Filter by Status"
                    onChange={handleFilterChange}
                  >
                    <MenuItem value="all">All Orders</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="confirmed">Confirmed</MenuItem>
                    <MenuItem value="preparing">Preparing</MenuItem>
                    <MenuItem value="ready_for_pickup">Ready for Pickup</MenuItem>
                    <MenuItem value="picked_up">Picked Up</MenuItem>
                    <MenuItem value="delivered">Delivered</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  id="search-order"
                  label="Search by Order ID or Customer"
                  variant="outlined"
                  size="small"
                  value={search}
                  onChange={handleSearchChange}
                />
              </Grid>
            </Grid>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            ) : error && !error.includes('create a restaurant') ? (
              <Box sx={{ textAlign: 'center', my: 4 }}>
                <Typography color="error" gutterBottom>{error}</Typography>
                <Button variant="contained" onClick={fetchOrders} sx={{ mt: 2 }}>
                  Try Again
                </Button>
              </Box>
            ) : (
              <>
                {filteredOrders.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="h6" color="text.secondary">
                      No orders found
                    </Typography>
                    <Typography color="text.secondary">
                      {filter !== 'all' 
                        ? 'Try selecting a different status filter' 
                        : 'You have no orders yet'}
                    </Typography>
                  </Box>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Order ID</TableCell>
                          <TableCell>Date & Time</TableCell>
                          <TableCell>Customer</TableCell>
                          <TableCell>Items</TableCell>
                          <TableCell align="right">Total</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell align="center">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredOrders
                          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                          .map((order) => {
                            const nextAction = getNextAction(order.status);
                            return (
                              <TableRow key={order._id}>
                                <TableCell component="th" scope="row">
                                  {order._id.substring(0, 8)}...
                                </TableCell>
                                <TableCell>{formatDate(order.createdAt)}</TableCell>
                                <TableCell>{order.customerName || 'Anonymous'}</TableCell>
                                <TableCell>{order.items.length} items</TableCell>
                                <TableCell align="right">Rs. {Number(order.totalAmount).toLocaleString('en-LK', { minimumFractionDigits: 2 })} LKR</TableCell>
                                <TableCell>
                                  <Chip 
                                    label={order.status} 
                                    color={getStatusColor(order.status)}
                                    size="small"
                                  />
                                </TableCell>
                                <TableCell align="center">
                                  <IconButton 
                                    color="primary"
                                    onClick={() => handleViewOrder(order)}
                                    size="small"
                                    title="View Order Details"
                                  >
                                    <VisibilityIcon fontSize="small" />
                                  </IconButton>
                                  {nextAction && (
                                    <IconButton
                                      color={nextAction.color}
                                      onClick={() => handleOpenStatusDialog(order)}
                                      size="small"
                                      title={nextAction.text}
                                    >
                                      {nextAction.icon}
                                    </IconButton>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}

                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={filteredOrders.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </>
            )}
          </Paper>

          {/* Order Details Dialog */}
          <Dialog 
            open={openOrderDialog} 
            onClose={handleCloseDialogs}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>
              Order Details
              <Typography variant="subtitle2" color="text.secondary">
                Order #{selectedOrder?._id}
              </Typography>
            </DialogTitle>
            <DialogContent dividers>
              {selectedOrder && (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>Customer Information</Typography>
                    <Typography><strong>Name:</strong> {selectedOrder.customerName || 'Not provided'}</Typography>
                    <Typography><strong>Phone:</strong> {selectedOrder.customerPhone || 'Not provided'}</Typography>
                    <Typography><strong>Address:</strong> {selectedOrder.deliveryAddress || 'Not provided'}</Typography>
                    <Typography><strong>Order Date:</strong> {formatDate(selectedOrder.createdAt)}</Typography>
                    
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>Order Status</Typography>
                      <Chip 
                        label={selectedOrder.status} 
                        color={getStatusColor(selectedOrder.status)}
                        sx={{ mr: 1 }}
                      />
                      {selectedOrder.status === 'Cancelled' && (
                        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                          Reason: {selectedOrder.cancellationReason || 'No reason provided'}
                        </Typography>
                      )}
                    </Box>
                    
                    {selectedOrder.specialInstructions && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>Special Instructions</Typography>
                        <Typography variant="body2">{selectedOrder.specialInstructions}</Typography>
                      </Box>
                    )}
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>Order Items</Typography>
                    <List dense>
                      {selectedOrder.items.map((item, index) => (
                        <ListItem key={index} sx={{ py: 1, px: 0 }}>
                          <ListItemText 
                            primary={`${item.quantity}x ${item.name}`} 
                            secondary={item.specialNotes ? `Note: ${item.specialNotes}` : null} 
                          />
                          <Typography variant="body2">
                            Rs. {Number(item.price * item.quantity).toLocaleString('en-LK', { minimumFractionDigits: 2 })} LKR
                          </Typography>
                        </ListItem>
                      ))}
                    </List>
                    
                    <Divider sx={{ my: 1 }} />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                      <Typography variant="subtitle1">Subtotal:</Typography>
                      <Typography variant="subtitle1">
                        Rs. {Number(calculateTotal(selectedOrder.items)).toLocaleString('en-LK', { minimumFractionDigits: 2 })} LKR
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="subtitle1">Delivery Fee:</Typography>
                      <Typography variant="subtitle1">
                        Rs. {Number(selectedOrder.deliveryFee || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })} LKR
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="subtitle1">Tax:</Typography>
                      <Typography variant="subtitle1">
                        Rs. {Number(selectedOrder.tax || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })} LKR
                      </Typography>
                    </Box>
                    
                    <Divider sx={{ my: 1 }} />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="h6">Total:</Typography>
                      <Typography variant="h6">
                        Rs. {Number(selectedOrder.totalAmount).toLocaleString('en-LK', { minimumFractionDigits: 2 })} LKR
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                      <Typography variant="subtitle2">Payment Method:</Typography>
                      <Typography variant="subtitle2">
                        {selectedOrder.paymentMethod || 'Not specified'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="subtitle2">Payment Status:</Typography>
                      <Chip 
                        label={selectedOrder.paymentStatus || 'Not paid'} 
                        color={selectedOrder.paymentStatus === 'Paid' ? 'success' : 'warning'}
                        size="small"
                      />
                    </Box>
                  </Grid>
                </Grid>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialogs}>Close</Button>
              {getNextAction(selectedOrder?.status) && (
                <Button 
                  onClick={() => {
                    const action = getNextAction(selectedOrder.status);
                    setNewStatus(action.status);
                    setOpenOrderDialog(false);
                    setOpenStatusDialog(true);
                  }} 
                  variant="contained" 
                  color="primary"
                  startIcon={getNextAction(selectedOrder?.status).icon}
                >
                  {getNextAction(selectedOrder?.status).text}
                </Button>
              )}
            </DialogActions>
          </Dialog>

          {/* Status Update Dialog */}
          <Dialog open={openStatusDialog} onClose={handleCloseDialogs}>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Update the status for order #{selectedOrder?._id.substring(0, 8)}
              </DialogContentText>
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel id="status-update-label">Status</InputLabel>
                <Select
                  labelId="status-update-label"
                  id="status-update-select"
                  value={newStatus}
                  label="Status"
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Confirmed">Confirmed</MenuItem>
                  <MenuItem value="Preparing">Preparing</MenuItem>
                  <MenuItem value="Ready_for_Pickup">Ready for Pickup</MenuItem>
                  <MenuItem value="Picked_up">Picked Up</MenuItem>
                  <MenuItem value="Delivered">Delivered</MenuItem>
                  <MenuItem value="Cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialogs}>Cancel</Button>
              <Button onClick={handleUpdateStatus} variant="contained" color="primary">
                Update Status
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Container>
  );
};

export default ManageOrders;