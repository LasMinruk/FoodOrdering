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
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Card,
  CardContent,
  CardMedia,
  Switch,
  FormControlLabel
} from '@mui/material';
import axios from 'axios';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import RestaurantIcon from '@mui/icons-material/Restaurant';

const AdminRestaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [openRestaurantDialog, setOpenRestaurantDialog] = useState(false);
  const [openVerifyDialog, setOpenVerifyDialog] = useState(false);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  useEffect(() => {
    console.log("Fetched restaurants:", restaurants);
    console.log("Current filter:", filter);
    console.log("Search query:", search);
    console.log("Filtered count:", filteredRestaurants.length);
  }, [restaurants, filter, search]);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5008/api/restaurant', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setRestaurants(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching restaurants:', err);
      setError('Failed to load restaurants. Please try again later.');
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

  const handleViewRestaurant = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setOpenRestaurantDialog(true);
  };

  const handleOpenVerifyDialog = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setOpenVerifyDialog(true);
  };

  const handleCloseRestaurantDialog = () => {
    setOpenRestaurantDialog(false);
    setSelectedRestaurant(null);
  };

  const handleCloseVerifyDialog = () => {
    setOpenVerifyDialog(false);
  };

  const handleToggleVerification = async () => {
    try {
      const newVerificationStatus = !selectedRestaurant.isVerified;
      
      await axios.patch(
        `http://localhost:5008/api/restaurant/${selectedRestaurant._id}/verify`, 
        { isVerified: newVerificationStatus },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      
      // Update the local state
      setRestaurants(restaurants.map(restaurant => 
        restaurant._id === selectedRestaurant._id 
          ? { ...restaurant, isVerified: newVerificationStatus } 
          : restaurant
      ));
      
      handleCloseVerifyDialog();
    } catch (err) {
      console.error('Error updating restaurant verification status:', err);
      setError('Failed to update restaurant verification status. Please try again.');
    }
  };

  // Filter restaurants based on status and search term
  const filteredRestaurants = restaurants.filter(restaurant => {
    // Logging to see the restaurant properties
    console.log('Filtering restaurant:', restaurant);
  
    // Handling verification as both boolean and string values
    const isVerified = restaurant.isVerified === true || restaurant.isVerified === 'true';
    const isUnverified = restaurant.isVerified === false || restaurant.isVerified === 'false';
    const isAvailable = restaurant.isAvailable === true || restaurant.isAvailable === 'true';
  
    // Logging the processed filter states
    console.log('isVerified:', isVerified, 'isUnverified:', isUnverified, 'isAvailable:', isAvailable);
  
    // Filter logic based on the current filter and search term
    const statusMatch =
      filter === 'all' ||
      (filter === 'verified' && isVerified) ||
      (filter === 'unverified' && isUnverified) ||
      (filter === 'available' && isAvailable && isVerified) ||
      (filter === 'unavailable' && !isAvailable && isVerified);
  
    // Check if restaurant matches the search term
    const searchTerm = search.toLowerCase();
    const searchMatch =
      restaurant._id.toLowerCase().includes(searchTerm) ||
      restaurant.name.toLowerCase().includes(searchTerm) ||
      restaurant.cuisine.toLowerCase().includes(searchTerm) ||
      restaurant.address.toLowerCase().includes(searchTerm);
  
    // Final matching
    const isMatch = statusMatch && searchMatch;
    console.log('Match:', isMatch);
  
    return isMatch;
  });
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading restaurants...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="error" variant="h6">{error}</Typography>
          <Button variant="contained" sx={{ mt: 2 }} onClick={fetchRestaurants}>
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
          Restaurant Management
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          View, verify, and manage restaurant listings
        </Typography>
      </Box>
      
      <Paper sx={{ mb: 4, p: 3 }}>
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
                <MenuItem value="all">All Restaurants</MenuItem>
                <MenuItem value="verified">Verified</MenuItem>
                <MenuItem value="unverified">Pending Verification</MenuItem>
                <MenuItem value="available">Available</MenuItem>
                <MenuItem value="unavailable">Unavailable</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={8}>
            <TextField
              fullWidth
              id="search-restaurant"
              label="Search by Name, Cuisine or Location"
              variant="outlined"
              size="small"
              value={search}
              onChange={handleSearchChange}
            />
          </Grid>
        </Grid>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Restaurant</TableCell>
                <TableCell>Cuisine</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRestaurants
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((restaurant) => (
                  <TableRow key={restaurant._id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {restaurant.image ? (
                          <Box
                            component="img"
                            src={restaurant.image}
                            alt={restaurant.name}
                            sx={{ width: 40, height: 40, mr: 2, borderRadius: 1 }}
                          />
                        ) : (
                          <Box sx={{ mr: 2 }}>
                            <RestaurantIcon color="primary" />
                          </Box>
                        )}
                        <Typography variant="body2">{restaurant.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{restaurant.cuisine}</TableCell>
                    <TableCell>{restaurant.address}</TableCell>
                    <TableCell>{restaurant.contactNumber}</TableCell>
                    <TableCell>
                      <Box>
                        <Chip 
                          label={restaurant.isVerified ? 'Verified' : 'Unverified'}
                          color={restaurant.isVerified ? 'success' : 'warning'}
                          size="small"
                          sx={{ mb: 0.5 }}
                        />
                        {restaurant.isVerified && (
                          <Chip 
                            label={restaurant.isAvailable ? 'Available' : 'Unavailable'}
                            color={restaurant.isAvailable ? 'info' : 'default'}
                            size="small"
                            sx={{ ml: 0.5 }}
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="primary"
                        onClick={() => handleViewRestaurant(restaurant)}
                        size="small"
                        title="View Restaurant Details"
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        color={restaurant.isVerified ? "error" : "success"}
                        onClick={() => handleOpenVerifyDialog(restaurant)}
                        size="small"
                        title={restaurant.isVerified ? "Remove Verification" : "Verify Restaurant"}
                      >
                        {restaurant.isVerified ? <BlockIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              {filteredRestaurants.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No restaurants found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredRestaurants.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Restaurant Details Dialog */}
      <Dialog 
        open={openRestaurantDialog} 
        onClose={handleCloseRestaurantDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Restaurant Details</DialogTitle>
        <DialogContent>
          {selectedRestaurant && (
            <Box sx={{ pt: 1 }}>
              <Card sx={{ mb: 3 }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={selectedRestaurant.image || "https://via.placeholder.com/800x200?text=Restaurant+Image"}
                  alt={selectedRestaurant.name}
                  sx={{ objectFit: "cover" }}
                />
                <CardContent>
                  <Typography variant="h5" gutterBottom>{selectedRestaurant.name}</Typography>
                  
                  <Box sx={{ display: 'flex', mb: 2 }}>
                    <Chip 
                      label={selectedRestaurant.isVerified ? 'Verified' : 'Unverified'}
                      color={selectedRestaurant.isVerified ? 'success' : 'warning'}
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    {selectedRestaurant.isVerified && (
                      <Chip 
                        label={selectedRestaurant.isAvailable ? 'Available' : 'Unavailable'}
                        color={selectedRestaurant.isAvailable ? 'info' : 'default'}
                        size="small"
                      />
                    )}
                  </Box>
                  
                  <Typography variant="subtitle2" gutterBottom>Restaurant Information</Typography>
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Cuisine</Typography>
                      <Typography variant="body1">{selectedRestaurant.cuisine}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Contact Number</Typography>
                      <Typography variant="body1">{selectedRestaurant.contactNumber}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">Address</Typography>
                      <Typography variant="body1">{selectedRestaurant.address}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">Owner ID</Typography>
                      <Typography variant="body1">{selectedRestaurant.ownerId}</Typography>
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 2 }}>
                    <FormControlLabel
                      control={
                        <Switch 
                          checked={selectedRestaurant.isVerified} 
                          color="success"
                          disabled
                        />
                      }
                      label="Verification Status"
                    />
                  </Box>
                </CardContent>
              </Card>

              {selectedRestaurant.menu && selectedRestaurant.menu.length > 0 && (
                <>
                  <Typography variant="h6" gutterBottom>Menu Items</Typography>
                  <TableContainer component={Paper}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Item</TableCell>
                          <TableCell>Description</TableCell>
                          <TableCell align="right">Price</TableCell>
                          <TableCell>Category</TableCell>
                          <TableCell align="center">Available</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedRestaurant.menu.map((item) => (
                          <TableRow key={item._id}>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>{item.description}</TableCell>
                            <TableCell align="right">${item.price?.toFixed(2)}</TableCell>
                            <TableCell>{item.category}</TableCell>
                            <TableCell align="center">
                              <Chip 
                                label={item.isAvailable ? 'Yes' : 'No'}
                                color={item.isAvailable ? 'success' : 'error'}
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRestaurantDialog}>Close</Button>
          <Button 
            onClick={() => handleOpenVerifyDialog(selectedRestaurant)}
            variant="contained" 
            color={selectedRestaurant?.isVerified ? "error" : "success"}
          >
            {selectedRestaurant?.isVerified ? 'Remove Verification' : 'Verify Restaurant'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Verification Dialog */}
      <Dialog open={openVerifyDialog} onClose={handleCloseVerifyDialog}>
        <DialogTitle>
          {selectedRestaurant?.isVerified ? 'Remove Restaurant Verification' : 'Verify Restaurant'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {selectedRestaurant?.isVerified 
              ? `Are you sure you want to remove verification from ${selectedRestaurant?.name}? The restaurant will no longer be visible to customers until verified again.`
              : `Are you sure you want to verify ${selectedRestaurant?.name}? This will make the restaurant visible to all customers.`
            }
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseVerifyDialog}>Cancel</Button>
          <Button 
            onClick={handleToggleVerification} 
            variant="contained" 
            color={selectedRestaurant?.isVerified ? "error" : "success"}
          >
            {selectedRestaurant?.isVerified ? 'Remove Verification' : 'Verify Restaurant'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminRestaurants;