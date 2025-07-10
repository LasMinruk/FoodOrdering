import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  Avatar,
  Divider,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent,
  IconButton
} from '@mui/material';
import {
  Person,
  LocationOn,
  History,
  Favorite,
  CreditCard,
  Edit,
  Add,
  Delete
} from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api'; // Using our centralized api service

const ProfilePage = () => {
  const { currentUser, updateProfile, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    image: '',
    addresses: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    name: '',
    phone: '',
    image: ''
  });
  const [newAddress, setNewAddress] = useState({
    addressLine1: '',
    addressLine2: '',
    homeTown: '',
    postalCode: '',
    isDefault: false
  });
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [addressError, setAddressError] = useState('');
  const [recentOrders, setRecentOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }

    // Initialize profile data once currentUser is available
    if (currentUser) {
      setProfileData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        image: currentUser.image || '',
        addresses: currentUser.address || [] // Note: backend uses 'address' not 'addresses'
      });

      setEditedData({
        name: currentUser.name || '',
        phone: currentUser.phone || '',
        image: currentUser.image || ''
      });

      // Fetch recent orders
      if (tabValue === 1) {
        fetchRecentOrders();
      }
    }
  }, [currentUser, isAuthenticated, authLoading, navigate, tabValue]);

  const fetchRecentOrders = async () => {
    if (!currentUser) return;

    try {
      setLoadingOrders(true);
      const response = await api.get(`/orders/customer/${currentUser._id}/recent`);
      setRecentOrders(response.data);
      setLoadingOrders(false);
    } catch (err) {
      console.error('Error fetching recent orders:', err);
      setLoadingOrders(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Reset edited data to current profile data
      setEditedData({
        name: profileData.name,
        phone: profileData.phone,
        image: profileData.image
      });
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData({
      ...editedData,
      [name]: value
    });
  };

  const handleAddressInputChange = (e) => {
    const { name, value } = e.target;
    setNewAddress({
      ...newAddress,
      [name]: value
    });
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Use the updateProfile function from AuthContext
      const result = await updateProfile(editedData);

      if (result.success) {
        // Update local state after successful profile update
        setProfileData({
          ...profileData,
          name: editedData.name,
          phone: editedData.phone,
          image: editedData.image
        });

        setSuccess('Profile updated successfully!');
        setIsEditing(false);
      } else {
        setError(result.error || 'Failed to update profile.');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async () => {
    // Validate address fields
    if (!newAddress.addressLine1 || !newAddress.homeTown || !newAddress.postalCode) {
      setAddressError('Please fill in all required address fields.');
      return;
    }

    try {
      setLoading(true);
      setAddressError('');

      // Call API to add address
      const response = await api.post('/auth/address', newAddress);

      if (response.data) {
        // Update auth context
        const result = await updateProfile({
          ...currentUser,
          address: [...(currentUser.address || []), response.data]
        });

        if (result.success) {
          // Update local state
          setProfileData({
            ...profileData,
            addresses: [...profileData.addresses, response.data]
          });

          setSuccess('Address added successfully!');
          setIsAddingAddress(false);
          setNewAddress({
            addressLine1: '',
            addressLine2: '',
            homeTown: '',
            postalCode: '',
            isDefault: false
          });
        } else {
          setAddressError(result.error || 'Failed to update profile with new address.');
        }
      }
    } catch (err) {
      console.error('Error adding address:', err);
      setAddressError('Failed to add address. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      setLoading(true);
      setError('');

      // Call API to delete address
      await api.delete(`/auth/address/${addressId}`);

      // Update local state
      const updatedAddresses = profileData.addresses.filter(
        address => address._id !== addressId
      );
      
      setProfileData({
        ...profileData,
        addresses: updatedAddresses
      });

      // Update auth context
      await updateProfile({
        ...currentUser,
        address: updatedAddresses
      });

      setSuccess('Address deleted successfully!');
    } catch (err) {
      console.error('Error deleting address:', err);
      setError('Failed to delete address. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      setLoading(true);
      setError('');

      // Call API to set default address
      await api.put(`/auth/address/${addressId}/default`);

      // Update local state
      const updatedAddresses = profileData.addresses.map(address => ({
        ...address,
        isDefault: address._id === addressId
      }));
      
      setProfileData({
        ...profileData,
        addresses: updatedAddresses
      });

      // Update auth context
      await updateProfile({
        ...currentUser,
        address: updatedAddresses
      });

      setSuccess('Default address updated successfully!');
    } catch (err) {
      console.error('Error updating default address:', err);
      setError('Failed to update default address. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.addressLine1}, ${address.addressLine2 ? address.addressLine2 + ', ' : ''}${address.homeTown}, ${address.postalCode}`;
  };

  // Show loading spinner while auth state is being determined
  if (authLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  // Rest of the component remains the same
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'center', md: 'flex-start' }, mb: 3 }}>
          <Avatar
            src={profileData.image}
            alt={profileData.name}
            sx={{ width: 100, height: 100, mr: { xs: 0, md: 3 }, mb: { xs: 2, md: 0 } }}
          />
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="h4" gutterBottom>
                {profileData.name}
              </Typography>
              <IconButton 
                color="primary" 
                sx={{ ml: 1 }}
                onClick={handleEditToggle}
              >
                <Edit />
              </IconButton>
            </Box>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              {profileData.email}
            </Typography>
            {profileData.phone && (
              <Typography variant="body1" color="text.secondary">
                {profileData.phone}
              </Typography>
            )}
          </Box>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="profile tabs"
          >
            <Tab icon={<Person />} label="Profile" />
            <Tab icon={<History />} label="Order History" />
            <Tab icon={<LocationOn />} label="Addresses" />
            <Tab icon={<Favorite />} label="Favorites" />
            <Tab icon={<CreditCard />} label="Payment Methods" />
          </Tabs>
        </Box>
        
        {/* Profile Tab */}
        {tabValue === 0 && (
          <Box sx={{ pt: 3 }}>
            {isEditing ? (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    name="name"
                    value={editedData.name}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    name="phone"
                    value={editedData.phone}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Profile Image URL"
                    name="image"
                    value={editedData.image}
                    onChange={handleInputChange}
                    placeholder="https://example.com/profile-image.jpg"
                    helperText="Enter a URL for your profile image"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    onClick={handleSaveProfile}
                    disabled={loading}
                    sx={{ mr: 2 }}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Save Changes'}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleEditToggle}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </Grid>
              </Grid>
            ) : (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Account Information
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Full Name</Typography>
                      <Typography variant="body1">{profileData.name}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Email</Typography>
                      <Typography variant="body1">{profileData.email}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Phone Number</Typography>
                      <Typography variant="body1">{profileData.phone || 'Not provided'}</Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    onClick={handleEditToggle}
                  >
                    Edit Profile
                  </Button>
                </Grid>
              </Grid>
            )}
          </Box>
        )}
        
        {/* Order History Tab */}
        {tabValue === 1 && (
          <Box sx={{ pt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Orders
            </Typography>
            
            {loadingOrders ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : recentOrders.length === 0 ? (
              <Typography variant="body1" color="text.secondary">
                You don't have any recent orders.
              </Typography>
            ) : (
              <List>
                {recentOrders.map((order) => (
                  <ListItem
                    key={order._id}
                    divider
                    secondaryAction={
                      <Button 
                        variant="outlined" 
                        size="small"
                        onClick={() => navigate(`/order/${order._id}`)}
                      >
                        Details
                      </Button>
                    }
                  >
                    <ListItemText
                      primary={`Order #${order._id.substring(order._id.length - 6)}`}
                      secondary={
                        <React.Fragment>
                          <Typography component="span" variant="body2" color="text.primary">
                            {order.restaurantName} - Rs. {order.totalAmount ? Number(order.totalAmount).toLocaleString('en-LK', { minimumFractionDigits: 2 }) : '0.00'} LKR
                          </Typography>
                          {` - ${new Date(order.createdAt).toLocaleDateString()}`}
                        </React.Fragment>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
            
            <Box sx={{ mt: 3 }}>
              <Button 
                variant="contained" 
                onClick={() => navigate('/orders')}
              >
                View All Orders
              </Button>
            </Box>
          </Box>
        )}
        
        {/* Addresses Tab */}
        {tabValue === 2 && (
          <Box sx={{ pt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Your Addresses
              </Typography>
              {!isAddingAddress && (
                <Button
                  startIcon={<Add />}
                  variant="outlined"
                  onClick={() => setIsAddingAddress(true)}
                >
                  Add New Address
                </Button>
              )}
            </Box>
            
            {addressError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {addressError}
              </Alert>
            )}
            
            {isAddingAddress && (
              <Card variant="outlined" sx={{ mb: 3, p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Add New Address
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      required
                      label="Address Line 1"
                      name="addressLine1"
                      value={newAddress.addressLine1}
                      onChange={handleAddressInputChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Address Line 2 (Optional)"
                      name="addressLine2"
                      value={newAddress.addressLine2}
                      onChange={handleAddressInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      required
                      label="City/Town"
                      name="homeTown"
                      value={newAddress.homeTown}
                      onChange={handleAddressInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      required
                      label="Postal Code"
                      name="postalCode"
                      value={newAddress.postalCode}
                      onChange={handleAddressInputChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                      <Button
                        variant="outlined"
                        onClick={() => {
                          setIsAddingAddress(false);
                          setAddressError('');
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="contained"
                        onClick={handleAddAddress}
                        disabled={loading}
                      >
                        {loading ? <CircularProgress size={24} /> : 'Save Address'}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Card>
            )}
            
            {!profileData.addresses || profileData.addresses.length === 0 ? (
              <Typography variant="body1" color="text.secondary">
                You don't have any saved addresses yet.
              </Typography>
            ) : (
              <Grid container spacing={3}>
                {profileData.addresses.map((address) => (
                  <Grid item xs={12} sm={6} key={address._id}>
                    <Card variant={address.isDefault ? 'elevation' : 'outlined'} elevation={address.isDefault ? 3 : 0}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Typography variant="h6" gutterBottom>
                            {address.isDefault && 'Default Address'}
                            {!address.isDefault && 'Address'}
                          </Typography>
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteAddress(address._id)}
                            disabled={loading}
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                        <Typography variant="body1" paragraph>
                          {formatAddress(address)}
                        </Typography>
                        {!address.isDefault && (
                          <Button
                            variant="text"
                            size="small"
                            onClick={() => handleSetDefaultAddress(address._id)}
                            disabled={loading}
                          >
                            Set as Default
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}
        
        {/* Favorites Tab */}
        {tabValue === 3 && (
          <Box sx={{ pt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Your Favorite Restaurants
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/favorite-restaurants')}
              sx={{ mt: 2 }}
            >
              View Favorites
            </Button>
          </Box>
        )}
        
        {/* Payment Methods Tab */}
        {tabValue === 4 && (
          <Box sx={{ pt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Saved Payment Methods
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Payment methods are managed securely during checkout.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/checkout')}
              sx={{ mt: 2 }}
            >
              Go to Checkout
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default ProfilePage;