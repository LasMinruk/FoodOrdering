import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  Box, 
  TextField, 
  Button, 
  Grid, 
  Avatar, 
  Divider,
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent,
  Tabs,
  Tab
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const UserProfile = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [value, setValue] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    image: '',
    address: {
      addressLine1: '',
      addressLine2: '',
      homeTown: '',
      postalCode: ''
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      image: user.image || '',
      address: user.address?.[0] || {
        addressLine1: '',
        addressLine2: '',
        homeTown: '',
        postalCode: ''
      }
    });
  }, [user, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await updateProfile(formData);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setValue(newValue);
  };

  if (!user) {
    return <Typography>Please log in to view your profile.</Typography>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar
            src={user.image}
            alt={user.name}
            sx={{ width: 80, height: 80, mr: 2 }}
          />
          <Typography variant="h4">{user.name}'s Profile</Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={value} onChange={handleTabChange} aria-label="profile tabs">
            <Tab label="Personal Information" />
            <Tab label="Order History" />
            <Tab label="Favorite Restaurants" />
            <Tab label="Payment Methods" />
          </Tabs>
        </Box>

        {/* Personal Information Tab */}
        {value === 0 && (
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            {error && (
              <Typography color="error" sx={{ mb: 2 }}>
                {error}
              </Typography>
            )}
            {success && (
              <Typography color="success.main" sx={{ mb: 2 }}>
                {success}
              </Typography>
            )}

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  margin="normal"
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Profile Image URL"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mt: 2 }}>
                  Address Information
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Address Line 1"
                  name="address.addressLine1"
                  value={formData.address.addressLine1}
                  onChange={handleChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Address Line 2"
                  name="address.addressLine2"
                  value={formData.address.addressLine2}
                  onChange={handleChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Town/City"
                  name="address.homeTown"
                  value={formData.address.homeTown}
                  onChange={handleChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Postal Code"
                  name="address.postalCode"
                  value={formData.address.postalCode}
                  onChange={handleChange}
                  margin="normal"
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  sx={{ mt: 2 }}
                >
                  {loading ? 'Updating...' : 'Update Profile'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Other tabs will be implemented in separate components */}
        {value === 1 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6">Order History</Typography>
            {/* Order history will be implemented with order service */}
          </Box>
        )}

        {value === 2 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6">Favorite Restaurants</Typography>
            {/* Favorites will be implemented with restaurant service */}
          </Box>
        )}

        {value === 3 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6">Payment Methods</Typography>
            {/* Payment methods will be implemented with payment service */}
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default UserProfile;