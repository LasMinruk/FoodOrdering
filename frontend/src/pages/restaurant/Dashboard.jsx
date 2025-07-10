import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  Rating,
  Chip,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import StarIcon from '@mui/icons-material/Star';

const RestaurantDashboard = () => {
  const { currentUser, loading: authLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [stats, setStats] = useState({
    orders: { total: 0, pending: 0, completed: 0, cancelled: 0 },
    revenue: { today: 0, thisWeek: 0, thisMonth: 0, total: 0 },
    topItems: [],
    recentReviews: []
  });

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated || !currentUser || currentUser.role !== 'restaurant_admin') {
      navigate('/login');
      return;
    }

    fetchRestaurants();
  }, [authLoading, currentUser, isAuthenticated]);

  useEffect(() => {
    if (selectedRestaurant) {
      fetchRestaurantStats(selectedRestaurant._id);
    }
  }, [selectedRestaurant]);

  const fetchRestaurants = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const response = await axios.get(
        `http://localhost:5008/api/restaurant?ownerId=${currentUser._id}`,
        { headers }
      );

      if (!response.data || response.data.length === 0) {
        setError('No restaurants found. Please create one.');
        setLoading(false);
        return;
      }

      setRestaurants(response.data);
      setSelectedRestaurant(response.data[0]);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch restaurants.');
      setLoading(false);
    }
  };

  const fetchRestaurantStats = async (restaurantId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const statsResponse = await axios.get(
        `http://localhost:5001/api/orders/stats/${restaurantId}`,
        { headers }
      );

      const recentOrdersResponse = await axios.get(
        `http://localhost:5001/api/orders/restaurant/${restaurantId}?limit=5`,
        { headers }
      );

      const orderStats = statsResponse.data || {};
      const recentOrders = recentOrdersResponse.data || [];

      setStats({
        orders: {
          total: orderStats.totalOrders || 0,
          pending: orderStats.pendingOrders || 0,
          completed: orderStats.completedOrders || 0,
          cancelled: orderStats.cancelledOrders || 0
        },
        revenue: {
          today: orderStats.todayRevenue || 0,
          thisWeek: orderStats.weeklyRevenue || 0,
          thisMonth: orderStats.monthlyRevenue || 0,
          total: orderStats.totalRevenue || 0
        },
        topItems: orderStats.topSellingItems || [],
        recentReviews: recentOrders
          .filter(order => order.rating && order.review)
          .map(order => ({
            id: order._id,
            rating: order.rating,
            review: order.review,
            date: order.updatedAt
          }))
      });

      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch restaurant stats.');
      setLoading(false);
    }
  };

  const toggleAvailability = async () => {
    if (!selectedRestaurant) return;

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const newStatus = !selectedRestaurant.isAvailable;

      await axios.patch(
        `http://localhost:5008/api/restaurant/${selectedRestaurant._id}/availability`,
        { isAvailable: newStatus },
        { headers }
      );

      setSelectedRestaurant({ ...selectedRestaurant, isAvailable: newStatus });
    } catch (err) {
      console.error('Failed to toggle availability', err);
      setError('Failed to toggle availability.');
    }
  };

  if (authLoading || loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading dashboard...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="error">{error}</Typography>
          <Button
            variant="contained"
            onClick={() => (error.includes('create') ? navigate('/create-restaurant') : fetchRestaurants())}
            sx={{ mt: 2 }}
          >
            {error.includes('create') ? 'Create Restaurant' : 'Try Again'}
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: 1 }}>{selectedRestaurant.name} Dashboard</Typography>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Choose Restaurant</InputLabel>
            <Select
              value={selectedRestaurant._id}
              label="Choose Restaurant"
              onChange={(e) =>
                setSelectedRestaurant(restaurants.find(r => r._id === e.target.value))
              }
            >
              {restaurants.map((r) => (
                <MenuItem key={r._id} value={r._id}>
                  {r.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ mt: 1, display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
          <Chip label={selectedRestaurant.isVerified ? 'Verified' : 'Pending'} color={selectedRestaurant.isVerified ? 'success' : 'warning'} icon={<StarIcon />} />
          <Chip label={selectedRestaurant.isAvailable ? 'Open' : 'Closed'} color={selectedRestaurant.isAvailable ? 'info' : 'default'} icon={<RestaurantMenuIcon />} />
          <Button onClick={toggleAvailability} variant="contained" color={selectedRestaurant.isAvailable ? 'error' : 'success'} sx={{ ml: 2, borderRadius: 3, fontWeight: 600 }}>
            {selectedRestaurant.isAvailable ? 'Close Restaurant' : 'Open Restaurant'}
          </Button>
        </Box>
        <Divider sx={{ mt: 2, mb: 3 }} />
      </Box>

      {/* Create Restaurant Button */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" color="primary" onClick={() => navigate('/create-restaurant')} sx={{ borderRadius: 3, fontWeight: 600, boxShadow: 2 }}>
          <RestaurantMenuIcon sx={{ mr: 1 }} /> Create Another Restaurant
        </Button>
      </Box>

      {/* Revenue Cards */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 4, boxShadow: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <AttachMoneyIcon color="success" /> Revenue Overview
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {[
                ['Total Revenue', stats.revenue.total, 'success', <AttachMoneyIcon />],
                ['Today', stats.revenue.today, 'primary', <AttachMoneyIcon />],
                ['This Week', stats.revenue.thisWeek, 'warning', <AttachMoneyIcon />],
                ['This Month', stats.revenue.thisMonth, 'info', <AttachMoneyIcon />]
              ].map(([label, value, color, icon], idx) => (
                <Grid item xs={12} sm={3} key={idx}>
                  <Card sx={{ backgroundColor: `${color}.main`, borderRadius: 3, boxShadow: 3, transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.04)' } }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {icon}
                        <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 600 }}>{label}</Typography>
                      </Box>
                      <Typography variant="h5" sx={{ color: 'white', fontWeight: 700 }}>Rs. {Number(value).toLocaleString('en-LK', { minimumFractionDigits: 2 })} LKR</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Orders */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 4, boxShadow: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <ShoppingCartIcon color="secondary" /> Orders
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {[
                ['Total', stats.orders.total, 'secondary', <ShoppingCartIcon />],
                ['Pending', stats.orders.pending, 'error', <ShoppingCartIcon />],
                ['Completed', stats.orders.completed, 'success', <ShoppingCartIcon />],
                ['Cancelled', stats.orders.cancelled, 'default', <ShoppingCartIcon />]
              ].map(([label, value, color, icon], idx) => (
                <Grid item xs={6} key={idx}>
                  <Card sx={{ backgroundColor: `${color}.main`, borderRadius: 3, boxShadow: 3, transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.04)' } }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {icon}
                        <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 600 }}>{label}</Typography>
                      </Box>
                      <Typography variant="h5" sx={{ color: 'white', fontWeight: 700 }}>{value}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            <Box sx={{ mt: 2, textAlign: 'right' }}>
              <Button onClick={() => navigate('/restaurant/orders')} variant="contained" color="secondary" sx={{ borderRadius: 3, fontWeight: 600, boxShadow: 2 }}>
                <ShoppingCartIcon sx={{ mr: 1 }} /> View Orders
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Top Items */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 4, boxShadow: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <RestaurantMenuIcon color="primary" /> Top Selling Items
            </Typography>
            {stats.topItems.length ? (
              <List>
                {stats.topItems.map((item, idx) => (
                  <ListItem key={idx}>
                    <ListItemText
                      primary={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><RestaurantMenuIcon fontSize="small" /> {item.name}</Box>}
                      secondary={`Sold: ${item.count} | Revenue: Rs. ${Number(item.count * item.price).toLocaleString('en-LK', { minimumFractionDigits: 2 })} LKR`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography>No sales data yet.</Typography>
            )}
            <Box sx={{ mt: 2, textAlign: 'right' }}>
              <Button onClick={() => navigate('/restaurant/menu')} variant="contained" color="primary" sx={{ borderRadius: 3, fontWeight: 600, boxShadow: 2 }}>
                <RestaurantMenuIcon sx={{ mr: 1 }} /> Manage Menu
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Reviews */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 4, boxShadow: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <StarIcon color="warning" /> Recent Reviews
            </Typography>
            {stats.recentReviews.length ? (
              <List>
                {stats.recentReviews.map((r) => (
                  <ListItem key={r.id}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Rating value={r.rating} readOnly size="small" />
                          <Typography variant="body2" color="text.secondary">
                            {new Date(r.date).toLocaleDateString()}
                          </Typography>
                        </Box>
                      }
                      secondary={r.review}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography>No reviews yet.</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default RestaurantDashboard;
