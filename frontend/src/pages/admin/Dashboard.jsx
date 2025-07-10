import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Button,
  IconButton,
  Avatar
} from '@mui/material';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import PeopleIcon from '@mui/icons-material/People';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining';
import MoreVertIcon from '@mui/icons-material/MoreVert';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const AdminDashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState({
    totalOrders: 0,
    totalUsers: 0,
    totalRestaurants: 0,
    totalRevenue: 0,
    recentOrders: [],
    pendingApprovals: 0,
    orderStats: {
      pending: 0,
      processing: 0,
      delivered: 0,
      cancelled: 0
    },
    revenueByMonth: [],
    usersByType: {
      customers: 0,
      restaurantOwners: 0,
      deliveryPersons: 0,
      admins: 0
    }
  });

  useEffect(() => {
    console.log("User object:", currentUser);
    if (currentUser?.role !== 'admin') {
      navigate('/login');
      return;
    }
    
    fetchDashboardData();
  }, [currentUser, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // For a real application, you would fetch this data from your API
      // This is placeholder data for demo purposes
      
      // Fetch users data
      const usersResponse = await axios.get('http://localhost:5007/api/auth/users', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      // Fetch orders data
      const ordersResponse = await axios.get('http://localhost:5001/api/orders/admin/stats', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      // Fetch restaurants data
      const restaurantsResponse = await axios.get('http://localhost:5008/api/restaurant', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      // Process the data
      const users = usersResponse.data || [];
      const orderStats = ordersResponse.data || { 
        totalOrders: 0, 
        totalRevenue: 0,
        ordersByStatus: { pending: 0, processing: 0, delivered: 0, cancelled: 0 },
        recentOrders: [],
        revenueByMonth: []
      };
      const restaurants = restaurantsResponse.data || [];
      
      // Count users by type
      const usersByType = {
        customers: users.filter(user => user.role === 'customer').length,
        restaurantOwners: users.filter(user => user.role === 'restaurant_admin').length,
        deliveryPersons: users.filter(user => user.role === 'delivery_person').length,
        admins: users.filter(user => user.role === 'admin').length
      };
      
      // Count pending approvals (for example, restaurants waiting for verification)
      const pendingApprovals = restaurants.filter(restaurant => !restaurant.isVerified).length;
      
      setDashboardData({
        totalOrders: orderStats.totalOrders || 0,
        totalUsers: users.length || 0,
        totalRestaurants: restaurants.length || 0,
        totalRevenue: orderStats.totalRevenue || 0,
        recentOrders: orderStats.recentOrders || [],
        pendingApprovals,
        orderStats: orderStats.ordersByStatus || {
          pending: 0,
          processing: 0,
          delivered: 0,
          cancelled: 0
        },
        revenueByMonth: orderStats.revenueByMonth || generatePlaceholderRevenueData(),
        usersByType
      });
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please refresh the page to try again.');
      setLoading(false);
    }
  };

  // Generate placeholder data if real data isn't available
  const generatePlaceholderRevenueData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    
    return Array.from({ length: 6 }, (_, i) => {
      const monthIndex = (currentMonth - 5 + i) % 12;
      return {
        month: months[monthIndex],
        revenue: Math.floor(Math.random() * 10000) + 5000
      };
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading dashboard data...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="error" variant="h6">{error}</Typography>
          <Button variant="contained" sx={{ mt: 2 }} onClick={fetchDashboardData}>
            Retry
          </Button>
        </Paper>
      </Container>
    );
  }

  // Chart data for order status distribution
  const orderStatusChartData = {
    labels: ['Pending', 'Processing', 'Delivered', 'Cancelled'],
    datasets: [
      {
        data: [
          dashboardData.orderStats.pending,
          dashboardData.orderStats.processing,
          dashboardData.orderStats.delivered,
          dashboardData.orderStats.cancelled
        ],
        backgroundColor: [
          'rgba(255, 159, 64, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(255, 99, 132, 0.7)'
        ],
        borderColor: [
          'rgb(255, 159, 64)',
          'rgb(54, 162, 235)',
          'rgb(75, 192, 192)',
          'rgb(255, 99, 132)'
        ],
        borderWidth: 1
      }
    ]
  };

  // Chart data for user types
  const userTypesChartData = {
    labels: ['Customers', 'Restaurant Owners', 'Delivery Persons', 'Admins'],
    datasets: [
      {
        data: [
          dashboardData.usersByType.customers,
          dashboardData.usersByType.restaurantOwners,
          dashboardData.usersByType.deliveryPersons,
          dashboardData.usersByType.admins
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)'
        ],
        borderColor: [
          'rgb(255, 99, 132)',
          'rgb(54, 162, 235)',
          'rgb(75, 192, 192)',
          'rgb(153, 102, 255)'
        ],
        borderWidth: 1
      }
    ]
  };

  // Chart data for monthly revenue
  const revenueChartData = {
    labels: dashboardData.revenueByMonth.map(item => item.month),
    datasets: [
      {
        label: 'Monthly Revenue',
        data: dashboardData.revenueByMonth.map(item => item.revenue),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgb(75, 192, 192)',
        borderWidth: 1
      }
    ]
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 8 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Overview of platform metrics and activities
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="text.secondary" variant="overline" sx={{ fontSize: '0.75rem' }}>
                  Total Orders
                </Typography>
                <Typography variant="h4" component="div">
                  {dashboardData.totalOrders}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <ShoppingBasketIcon />
              </Avatar>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="text.secondary" variant="overline" sx={{ fontSize: '0.75rem' }}>
                  Total Revenue
                </Typography>
                <Typography variant="h4" component="div">
                  {formatCurrency(dashboardData.totalRevenue)}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'success.main' }}>
                <MonetizationOnIcon />
              </Avatar>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="text.secondary" variant="overline" sx={{ fontSize: '0.75rem' }}>
                  Total Users
                </Typography>
                <Typography variant="h4" component="div">
                  {dashboardData.totalUsers}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'info.main' }}>
                <PeopleIcon />
              </Avatar>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="text.secondary" variant="overline" sx={{ fontSize: '0.75rem' }}>
                  Restaurants
                </Typography>
                <Typography variant="h4" component="div">
                  {dashboardData.totalRestaurants}
                </Typography>
                {dashboardData.pendingApprovals > 0 && (
                  <Typography variant="caption" color="primary">
                    {dashboardData.pendingApprovals} pending approval
                  </Typography>
                )}
              </Box>
              <Avatar sx={{ bgcolor: 'warning.main' }}>
                <RestaurantIcon />
              </Avatar>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts and Additional Data */}
      <Grid container spacing={3}>
        {/* Monthly Revenue Chart */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Monthly Revenue
            </Typography>
            <Box sx={{ height: 300, mt: 2 }}>
              <Bar 
                data={revenueChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: function(value) {
                          return '$' + value;
                        }
                      }
                    }
                  }
                }}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Order Status Distribution */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Order Status Distribution
            </Typography>
            <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Pie 
                data={orderStatusChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                }}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Recent Orders */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 0 }}>
            <CardHeader 
              title="Recent Orders" 
              action={
                <Button 
                  component={Link} 
                  to="/admin/orders"
                  size="small"
                  color="primary"
                >
                  View All
                </Button>
              }
            />
            <Divider />
            {dashboardData.recentOrders.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="text.secondary">No recent orders</Typography>
              </Box>
            ) : (
              <List sx={{ maxHeight: 350, overflow: 'auto' }}>
                {Array.isArray(dashboardData.recentOrders) && dashboardData.recentOrders.length > 0 ? (
    dashboardData.recentOrders.map((order) => (
      <React.Fragment key={order._id}>
        <ListItem 
          secondaryAction={
            <IconButton edge="end" aria-label="more">
              <MoreVertIcon />
            </IconButton>
          }
        >
          <ListItemText
            primary={`Order #${order._id.substring(0, 8)}... - ${formatCurrency(order.totalAmount)}`}
            secondary={
              <>
                <Typography component="span" variant="body2" color="text.primary">
                  {order.customerName}
                </Typography>
                {` — ${new Date(order.createdAt).toLocaleString()} • Status: ${order.status}`}
              </>
            }
          />
        </ListItem>
        <Divider variant="inset" component="li" />
      </React.Fragment>
    ))
  ) : (
    <ListItem>
      <ListItemText primary="No recent orders" />
    </ListItem>
  )}
              </List>
            )}
          </Paper>
        </Grid>

        {/* User Types Distribution */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              User Distribution
            </Typography>
            <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Pie 
                data={userTypesChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                }}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Quick Links */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={6} sm={3}>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  component={Link} 
                  to="/admin/orders"
                  startIcon={<ShoppingBasketIcon />}
                  sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                >
                  Manage Orders
                </Button>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  component={Link} 
                  to="/admin/users"
                  startIcon={<PeopleIcon />}
                  sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                >
                  Manage Users
                </Button>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  component={Link} 
                  to="/admin/restaurants"
                  startIcon={<RestaurantIcon />}
                  sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                >
                  Manage Restaurants
                </Button>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  startIcon={<DeliveryDiningIcon />}
                  sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                >
                  View Deliveries
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboard;