import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import CheckIcon from '@mui/icons-material/Check';

const DeliveryDashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeDeliveries, setActiveDeliveries] = useState([]);
  const [availableDeliveries, setAvailableDeliveries] = useState([]);
  const [error, setError] = useState('');
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [isLocationSharing, setIsLocationSharing] = useState(false);
  const [locationInterval, setLocationInterval] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);

  useEffect(() => {
    if (currentUser && currentUser.role !== 'delivery_person') {
      navigate('/login');
    }
    
    fetchDeliveries();
    checkLocationSharing();

    return () => {
      // Clean up location interval when component unmounts
      if (locationInterval) {
        clearInterval(locationInterval);
      }
    };
  }, [currentUser, navigate]);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      
      // Get active deliveries for this delivery person
      const activeResponse = await axios.get(
        `http://localhost:5010/api/delivery/active/driver/${currentUser._id}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      
      // Get available deliveries
      const availableResponse = await axios.get(
        'http://localhost:5010/api/delivery/active/all',
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      
      // Filter out deliveries that already have a delivery person assigned
      const availableDeliveries = availableResponse.data.filter(
        delivery => !delivery.deliveryPersonId
      );
      
      setActiveDeliveries(activeResponse.data || []);
      setAvailableDeliveries(availableDeliveries || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching deliveries:', err);
      setError('Failed to load deliveries. Please try again later.');
      setLoading(false);
    }
  };

  const handleOpenStatusDialog = (delivery) => {
    setSelectedDelivery(delivery);
    const options = getNextStatusOptions(delivery.status);
    setNewStatus(options.length > 0 ? options[0].value : '');
    setOpenStatusDialog(true);
  };

  const handleCloseStatusDialog = () => {
    setOpenStatusDialog(false);
    setSelectedDelivery(null);
    setNewStatus('');
  };

  const handleUpdateStatus = async () => {
    try {
      await axios.put(`http://localhost:5010/api/delivery/status/${selectedDelivery._id}`, {
        status: newStatus
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      // Update local state
      setActiveDeliveries(activeDeliveries.map(delivery => 
        delivery._id === selectedDelivery._id ? { ...delivery, status: newStatus } : delivery
      ));
      
      // If delivered, remove from active deliveries
      if (newStatus === 'delivered') {
        setActiveDeliveries(activeDeliveries.filter(
          delivery => delivery._id !== selectedDelivery._id
        ));
      }
      
      handleCloseStatusDialog();
      setSnackbar({
        open: true,
        message: 'Delivery status updated successfully',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error updating delivery status:', err);
      setSnackbar({
        open: true,
        message: 'Failed to update delivery status',
        severity: 'error'
      });
    }
  };

  const handleAcceptDelivery = async (delivery) => {
    try {
      await axios.put(`http://localhost:5010/api/delivery/assign`, {
        deliveryId: delivery._id,
        deliveryPersonId: currentUser._id
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      // Move from available to active
      setAvailableDeliveries(availableDeliveries.filter(d => d._id !== delivery._id));
      setActiveDeliveries([...activeDeliveries, { ...delivery, deliveryPersonId: currentUser._id }]);
      
      setSnackbar({
        open: true,
        message: 'Delivery accepted successfully',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error accepting delivery:', err);
      setSnackbar({
        open: true,
        message: 'Failed to accept delivery',
        severity: 'error'
      });
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'assigned':
        return 'info';
      case 'picked_up':
        return 'warning';
      case 'delivered':
        return 'success';
      default:
        return 'default';
    }
  };

  const getNextStatusOptions = (currentStatus) => {
    switch (currentStatus) {
      case 'assigned':
        return [{ value: 'picked_up', label: 'Picked Up' }];
      case 'picked_up':
        return [{ value: 'delivered', label: 'Delivered' }];
      default:
        return [];
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const startLocationSharing = () => {
    if (navigator.geolocation) {
      // Get current position immediately
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          updateLocationOnServer(latitude, longitude);
          setCurrentLocation({ latitude, longitude });
        },
        (error) => {
          console.error('Error getting location:', error);
          setSnackbar({
            open: true,
            message: 'Could not access your location. Please check permissions.',
            severity: 'error'
          });
        }
      );
      
      // Set up interval to update location regularly
      const intervalId = setInterval(() => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            updateLocationOnServer(latitude, longitude);
            setCurrentLocation({ latitude, longitude });
          },
          (error) => {
            console.error('Error getting location:', error);
          }
        );
      }, 60000); // Update every minute
      
      setLocationInterval(intervalId);
      setIsLocationSharing(true);
      
      setSnackbar({
        open: true,
        message: 'Location sharing activated',
        severity: 'success'
      });
    } else {
      setSnackbar({
        open: true,
        message: 'Geolocation is not supported by your browser',
        severity: 'error'
      });
    }
  };

  const stopLocationSharing = () => {
    if (locationInterval) {
      clearInterval(locationInterval);
      setLocationInterval(null);
      setIsLocationSharing(false);
      setSnackbar({
        open: true,
        message: 'Location sharing deactivated',
        severity: 'success'
      });
    }
  };

  const checkLocationSharing = () => {
    // Check if location sharing is already active
    if (locationInterval) {
      setIsLocationSharing(true);
    }
  };

  const updateLocationOnServer = async (latitude, longitude) => {
    try {
      await axios.post('http://localhost:5009/api/location', {
        agentId: currentUser._id,
        latitude,
        longitude
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
    } catch (err) {
      console.error('Error updating location:', err);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading dashboard data...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="error" variant="h6" gutterBottom>{error}</Typography>
          <Button variant="contained" sx={{ mt: 2 }} onClick={fetchDeliveries}>
            Try Again
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Delivery Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Manage your deliveries and track earnings
        </Typography>
        <Divider sx={{ my: 2 }} />
      </Box>
      
      <Grid container spacing={3}>
        {/* Status and Location Sharing */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Location Sharing
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isLocationSharing 
                  ? 'You are currently sharing your location with customers'
                  : 'Share your location to help customers track their deliveries'}
              </Typography>
              {currentLocation && isLocationSharing && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Current location: {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                </Typography>
              )}
            </Box>
            <Button
              variant="contained"
              color={isLocationSharing ? 'error' : 'primary'}
              onClick={isLocationSharing ? stopLocationSharing : startLocationSharing}
              startIcon={isLocationSharing ? <DeliveryDiningIcon /> : <DirectionsCarIcon />}
            >
              {isLocationSharing ? 'Stop Sharing Location' : 'Start Sharing Location'}
            </Button>
          </Paper>
        </Grid>

        {/* Active Deliveries */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Your Active Deliveries
            </Typography>
            
            {activeDeliveries.length === 0 ? (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <DeliveryDiningIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body1" color="text.secondary">
                  You don't have any active deliveries
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Accept a delivery from the available list
                </Typography>
              </Box>
            ) : (
              <List>
                {activeDeliveries.map(delivery => (
                  <ListItem 
                    key={delivery._id}
                    sx={{ 
                      mb: 2, 
                      border: 1, 
                      borderColor: 'divider', 
                      borderRadius: 1,
                      flexDirection: { xs: 'column', sm: 'row' },
                      alignItems: { xs: 'stretch', sm: 'center' }
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="subtitle1">
                            Order #{delivery.orderId.substring(0, 8)}
                          </Typography>
                          <Chip 
                            label={delivery.status}
                            color={getStatusColor(delivery.status)}
                            size="small"
                          />
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" component="span" display="block">
                            <strong>Customer:</strong> {delivery.customerName || 'Not provided'}
                          </Typography>
                          <Typography variant="body2" component="span" display="block">
                            <strong>Address:</strong> {delivery.deliveryAddress}
                          </Typography>
                          <Typography variant="body2" component="span" display="block" sx={{ mt: 1 }}>
                            <strong>Pickup:</strong> {delivery.restaurantName || 'Not provided'}
                          </Typography>
                        </>
                      }
                      sx={{ mb: { xs: 2, sm: 0 } }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: { xs: 'space-between', sm: 'flex-end' }, width: { xs: '100%', sm: 'auto' } }}>
                      {delivery.status !== 'delivered' && (
                        <Button
                          variant="contained"
                          size="small"
                          color="primary"
                          onClick={() => handleOpenStatusDialog(delivery)}
                          startIcon={delivery.status === 'picked_up' ? <CheckIcon /> : <DeliveryDiningIcon />}
                          sx={{ mr: 1 }}
                        >
                          {delivery.status === 'assigned' ? 'Mark Picked Up' : 'Complete Delivery'}
                        </Button>
                      )}
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => navigate(`/track/${delivery.orderId}`)}
                      >
                        Track
                      </Button>
                    </Box>
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
        
        {/* Earnings Summary & Available Deliveries */}
        <Grid item xs={12} md={5}>
          <Grid container spacing={3} direction="column" sx={{ height: '100%' }}>
            <Grid item>
              <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="h6" gutterBottom>Today's Earnings</Typography>
                      <Typography variant="h4">$0.00</Typography>
                    </Box>
                    <MonetizationOnIcon sx={{ fontSize: 40 }} />
                  </Box>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', bgcolor: 'primary.main' }}>
                  <Button 
                    size="small" 
                    sx={{ color: 'primary.contrastText' }}
                    onClick={() => navigate('/deliveries/earnings')}
                  >
                    View Earnings History
                  </Button>
                </CardActions>
              </Card>
            </Grid>
            
            <Grid item sx={{ flexGrow: 1 }}>
              <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" gutterBottom>
                  Available Deliveries
                </Typography>
                
                {availableDeliveries.length === 0 ? (
                  <Box sx={{ py: 4, textAlign: 'center', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Typography variant="body1" color="text.secondary">
                      No deliveries available at the moment
                    </Typography>
                    <Button 
                      variant="text" 
                      sx={{ mt: 2 }}
                      onClick={fetchDeliveries}
                    >
                      Refresh
                    </Button>
                  </Box>
                ) : (
                  <List sx={{ flexGrow: 1, overflow: 'auto' }}>
                    {availableDeliveries.map(delivery => (
                      <ListItem 
                        key={delivery._id}
                        sx={{ 
                          mb: 2, 
                          border: 1, 
                          borderColor: 'divider', 
                          borderRadius: 1,
                          flexDirection: { xs: 'column', sm: 'row' },
                          alignItems: { xs: 'stretch', sm: 'center' } 
                        }}
                      >
                        <ListItemText
                          primary={
                            <Typography variant="subtitle1">
                              Order #{delivery.orderId.substring(0, 8)}
                            </Typography>
                          }
                          secondary={
                            <>
                              <Typography variant="body2" component="span" display="block">
                                <strong>Restaurant:</strong> {delivery.restaurantName || 'Not provided'}
                              </Typography>
                              <Typography variant="body2" component="span" display="block">
                                <strong>Distance:</strong> {delivery.estimatedDistance || 'Not calculated'}
                              </Typography>
                              <Typography variant="body2" component="span" display="block" color="primary">
                                <strong>Delivery Fee:</strong> ${delivery.deliveryFee.toFixed(2)}
                              </Typography>
                            </>
                          }
                          sx={{ mb: { xs: 2, sm: 0 } }}
                        />
                        <Button
                          variant="contained"
                          size="small"
                          color="primary"
                          onClick={() => handleAcceptDelivery(delivery)}
                        >
                          Accept
                        </Button>
                      </ListItem>
                    ))}
                  </List>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Status Update Dialog */}
      <Dialog open={openStatusDialog} onClose={handleCloseStatusDialog}>
        <DialogTitle>Update Delivery Status</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Update status for order #{selectedDelivery?.orderId.substring(0, 8)}
          </Typography>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="status-update-label">Status</InputLabel>
            <Select
              labelId="status-update-label"
              id="status-update-select"
              value={newStatus}
              label="Status"
              onChange={(e) => setNewStatus(e.target.value)}
            >
              {getNextStatusOptions(selectedDelivery?.status).map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStatusDialog}>Cancel</Button>
          <Button onClick={handleUpdateStatus} variant="contained" color="primary">
            Update Status
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={5000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default DeliveryDashboard;