import React, { useState, useEffect } from 'react';
import { Tabs, Tab, Box, Typography, Container, Paper } from '@mui/material';
import RestaurantManagement from '../components/admin/RestaurantManagement';
import UserManagement from '../components/admin/UserManagement';
import OrderManagement from '../components/admin/OrderManagement';
import PaymentStats from '../components/admin/PaymentStats';
import DeliveryManagement from '../components/admin/DeliveryManagement';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const [value, setValue] = useState(0);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if not admin
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  if (!currentUser || currentUser.role !== 'admin') {
    return <Typography>You must be an admin to view this page.</Typography>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Admin Dashboard
        </Typography>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={value} onChange={handleChange} aria-label="admin dashboard tabs">
            <Tab label="Restaurants" />
            <Tab label="Users" />
            <Tab label="Orders" />
            <Tab label="Payments" />
            <Tab label="Deliveries" />
          </Tabs>
        </Box>
        <Box sx={{ py: 3 }}>
          {value === 0 && <RestaurantManagement />}
          {value === 1 && <UserManagement />}
          {value === 2 && <OrderManagement />}
          {value === 3 && <PaymentStats />}
          {value === 4 && <DeliveryManagement />}
        </Box>
      </Paper>
    </Container>
  );
};

export default AdminDashboard;