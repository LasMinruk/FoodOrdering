import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  CircularProgress,
  IconButton,
  Divider,
  Fab
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api'; // Use centralized API service
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';

const ManageMenu = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [menuItems, setMenuItems] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [error, setError] = useState('');
  const [restaurants, setRestaurants] = useState([]);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState('');
  const [itemFormData, setItemFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    isAvailable: true,
    specialNotes: ''
  });

  // For category filter
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [categories, setCategories] = useState([]);

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
    if (!selectedRestaurantId) return;
  
    const fetchRestaurantData = async () => {
      try {
        const response = await api.get(`/restaurant/${selectedRestaurantId}`);
        const restaurantData = response.data;
  
        setRestaurant(restaurantData);
        const newMenu = restaurantData.menu || [];
        setMenuItems(newMenu);
  
        const uniqueCategories = [...new Set(newMenu.map(item => item.category))];
        setCategories(uniqueCategories);
      } catch (err) {
        console.error('Error switching restaurant:', err);
        setError('Failed to switch restaurant. Please try again.');
      }
    };
  
    fetchRestaurantData();
  }, [selectedRestaurantId]);useEffect(() => {
  if (!selectedRestaurantId) return;

  const fetchRestaurantData = async () => {
    try {
      const response = await api.get(`/restaurant/${selectedRestaurantId}`);
      const restaurantData = response.data;

      setRestaurant(restaurantData);
      const newMenu = restaurantData.menu || [];
      setMenuItems(newMenu);

      const uniqueCategories = [...new Set(newMenu.map(item => item.category))];
      setCategories(uniqueCategories);
    } catch (err) {
      console.error('Error switching restaurant:', err);
      setError('Failed to switch restaurant. Please try again.');
    }
  };

  fetchRestaurantData();
}, [selectedRestaurantId]);

  const fetchRestaurantData = async () => {
    if (!currentUser || !currentUser._id) return;
  
    try {
      setLoading(true);
      const response = await api.get(`/restaurant?ownerId=${currentUser._id}`);
      const data = response.data;
  
      if (!data || data.length === 0) {
        setError('No restaurant found. Please create a restaurant first.');
        return;
      }
  
      setRestaurants(data);
      setSelectedRestaurantId(data[0]._id);
      setRestaurant(data[0]);
      setMenuItems(data[0].menu || []);
  
      const uniqueCategories = [...new Set((data[0].menu || []).map(item => item.category))];
      setCategories(uniqueCategories);
    } catch (err) {
      console.error('Error fetching restaurant data:', err);
      setError('Failed to load restaurant data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };  

  const handleRestaurantChange = async () => {
    if (!selectedRestaurantId) return;
  
    try {
      const response = await api.get(`/restaurant/${selectedRestaurantId}`);
      const newRestaurant = response.data;
  
      setRestaurant(newRestaurant);
      setMenuItems(newRestaurant.menu || []);
  
      const uniqueCategories = [...new Set((newRestaurant.menu || []).map(item => item.category))];
      setCategories(uniqueCategories);
    } catch (err) {
      console.error('Error switching restaurant:', err);
      setError('Failed to switch restaurant. Please try again.');
    }
  };
  

  const handleOpenAddDialog = () => {
    setItemFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      image: '',
      isAvailable: true,
      specialNotes: ''
    });
    setOpenAddDialog(true);
  };

  const handleOpenEditDialog = (item) => {
    setSelectedItem(item);
    setItemFormData({
      name: item.name,
      description: item.description || '',
      price: item.price,
      category: item.category,
      image: item.image || '',
      isAvailable: item.isAvailable,
      specialNotes: item.specialNotes || ''
    });
    setOpenEditDialog(true);
  };

  const handleOpenDeleteDialog = (item) => {
    setSelectedItem(item);
    setOpenDeleteDialog(true);
  };

  const handleCloseDialogs = () => {
    setOpenAddDialog(false);
    setOpenEditDialog(false);
    setOpenDeleteDialog(false);
    setSelectedItem(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setItemFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) : value
    }));
  };

  const handleSwitchChange = (e) => {
    setItemFormData(prev => ({
      ...prev,
      isAvailable: e.target.checked
    }));
  };

  const handleAddMenuItem = async () => {
    try {
      // Validate form
      if (!itemFormData.name || !itemFormData.price || !itemFormData.category) {
        setError('Name, price, and category are required');
        return;
      }
      
      const response = await api.post(
        `/restaurant/${restaurant._id}/menu`,
        itemFormData
      );
      
      // Add new item to local state
      setMenuItems([...menuItems, response.data]);
      
      // Update categories if needed
      if (!categories.includes(itemFormData.category)) {
        setCategories([...categories, itemFormData.category]);
      }
      
      handleCloseDialogs();
    } catch (err) {
      console.error('Error adding menu item:', err);
      setError('Failed to add menu item. Please try again.');
    }
  };

  const handleUpdateMenuItem = async () => {
    try {
      // Validate form
      if (!itemFormData.name || !itemFormData.price || !itemFormData.category) {
        setError('Name, price, and category are required');
        return;
      }
      
      const response = await api.put(
        `/restaurant/${restaurant._id}/menu/${selectedItem._id}`,
        itemFormData
      );
      
      // Update the item in local state
      setMenuItems(menuItems.map(item => 
        item._id === selectedItem._id ? response.data : item
      ));
      
      // Update categories if needed
      if (!categories.includes(itemFormData.category)) {
        setCategories([...categories, itemFormData.category]);
      }
      
      handleCloseDialogs();
    } catch (err) {
      console.error('Error updating menu item:', err);
      setError('Failed to update menu item. Please try again.');
    }
  };

  const handleDeleteMenuItem = async () => {
    try {
      await api.delete(`/restaurant/${restaurant._id}/menu/${selectedItem._id}`);
      
      // Remove the item from local state
      setMenuItems(menuItems.filter(item => item._id !== selectedItem._id));
      
      // Update categories if needed
      const remainingCategories = [...new Set(
        menuItems
          .filter(item => item._id !== selectedItem._id)
          .map(item => item.category)
      )];
      setCategories(remainingCategories);
      
      handleCloseDialogs();
    } catch (err) {
      console.error('Error deleting menu item:', err);
      setError('Failed to delete menu item. Please try again.');
    }
  };

  const handleCategoryFilterChange = (event) => {
    setCategoryFilter(event.target.value);
  };

  // Filter menu items by category
  const filteredMenuItems = categoryFilter === 'all'
    ? menuItems
    : menuItems.filter(item => item.category === categoryFilter);

  // Show loading spinner while auth state or data is being loaded
  if (authLoading || (loading && !error)) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          {authLoading ? 'Checking authentication...' : 'Loading menu data...'}
        </Typography>
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
              Manage Menu
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Add, update or remove menu items for {restaurant.name}
            </Typography>
            <Divider sx={{ my: 2 }} />
          </Box>
          
          <Paper sx={{ p: 3, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
  <InputLabel>Select Restaurant</InputLabel>
  <Select
    value={selectedRestaurantId}
    onChange={(e) => {
      setSelectedRestaurantId(e.target.value);
    }}
    onClose={handleRestaurantChange}
    label="Select Restaurant"
  >
    {restaurants.map((rest) => (
      <MenuItem key={rest._id} value={rest._id}>
        {rest.name}
      </MenuItem>
    ))}
  </Select>
</FormControl>

              <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Filter by Category</InputLabel>
                <Select
                  value={categoryFilter}
                  onChange={handleCategoryFilterChange}
                  label="Filter by Category"
                >
                  <MenuItem value="all">All Categories</MenuItem>
                  {categories.map(category => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleOpenAddDialog}
              >
                Add Menu Item
              </Button>
            </Box>

            {error && !error.includes('create a restaurant') && (
              <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
            )}
            
            {filteredMenuItems.length === 0 ? (
              <Box 
                sx={{ 
                  py: 5, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  justifyContent: 'center' 
                }}
              >
                <RestaurantMenuIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No menu items found
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                  {categoryFilter !== 'all' 
                    ? 'Try selecting a different category filter' 
                    : 'Start by adding your first menu item'}
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleOpenAddDialog}
                >
                  Add First Item
                </Button>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {filteredMenuItems.map(item => (
                  <Grid item key={item._id} xs={12} sm={6} md={4}>
                    <Card 
                      variant="outlined"
                      sx={{ 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column',
                        opacity: item.isAvailable ? 1 : 0.7
                      }}
                    >
                      {item.image ? (
                        <CardMedia
                          component="img"
                          height="140"
                          image={item.image}
                          alt={item.name}
                        />
                      ) : (
                        <Box 
                          sx={{ 
                            height: 140, 
                            bgcolor: 'grey.200', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center' 
                          }}
                        >
                          <RestaurantMenuIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
                        </Box>
                      )}
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="h6" component="div">
                            {item.name}
                          </Typography>
                          <Typography variant="h6" color="primary">
                            {typeof item.price === 'number' ? item.price.toFixed(2) : 'N/A'}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {item.category}
                        </Typography>
                        <Typography variant="body2">
                          {item.description}
                        </Typography>
                        {!item.isAvailable && (
                          <Typography 
                            variant="body2" 
                            color="error" 
                            sx={{ mt: 1, fontWeight: 'bold' }}
                          >
                            Currently unavailable
                          </Typography>
                        )}
                      </CardContent>
                      <CardActions>
                        <Button 
                          size="small" 
                          startIcon={<EditIcon />} 
                          onClick={() => handleOpenEditDialog(item)}
                        >
                          Edit
                        </Button>
                        <Button 
                          size="small" 
                          color="error" 
                          startIcon={<DeleteIcon />} 
                          onClick={() => handleOpenDeleteDialog(item)}
                        >
                          Delete
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
          
          {/* Floating Action Button for mobile */}
          <Box sx={{ display: { xs: 'block', md: 'none' }, position: 'fixed', bottom: 16, right: 16 }}>
            <Fab
              color="primary"
              aria-label="add"
              onClick={handleOpenAddDialog}
            >
              <AddIcon />
            </Fab>
          </Box>

          {/* Add Menu Item Dialog */}
          <Dialog open={openAddDialog} onClose={handleCloseDialogs} maxWidth="sm" fullWidth>
            <DialogTitle>Add Menu Item</DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="name"
                    label="Item Name"
                    fullWidth
                    required
                    value={itemFormData.name}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="price"
                    label="Price"
                    type="number"
                    fullWidth
                    required
                    value={itemFormData.price}
                    onChange={handleInputChange}
                    InputProps={{
                      startAdornment: '$',
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="category"
                    label="Category"
                    fullWidth
                    required
                    value={itemFormData.category}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="description"
                    label="Description"
                    multiline
                    rows={3}
                    fullWidth
                    value={itemFormData.description}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="image"
                    label="Image URL"
                    fullWidth
                    value={itemFormData.image}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="specialNotes"
                    label="Special Notes"
                    fullWidth
                    value={itemFormData.specialNotes}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={itemFormData.isAvailable}
                        onChange={handleSwitchChange}
                        name="isAvailable"
                        color="primary"
                      />
                    }
                    label="Item Available"
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialogs}>Cancel</Button>
              <Button 
                onClick={handleAddMenuItem} 
                variant="contained" 
                color="primary"
              >
                Add Item
              </Button>
            </DialogActions>
          </Dialog>

          {/* Edit Menu Item Dialog */}
          <Dialog open={openEditDialog} onClose={handleCloseDialogs} maxWidth="sm" fullWidth>
            <DialogTitle>Edit Menu Item</DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="name"
                    label="Item Name"
                    fullWidth
                    required
                    value={itemFormData.name}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="price"
                    label="Price"
                    type="number"
                    fullWidth
                    required
                    value={itemFormData.price}
                    onChange={handleInputChange}
                    InputProps={{
                      startAdornment: '$',
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="category"
                    label="Category"
                    fullWidth
                    required
                    value={itemFormData.category}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="description"
                    label="Description"
                    multiline
                    rows={3}
                    fullWidth
                    value={itemFormData.description}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="image"
                    label="Image URL"
                    fullWidth
                    value={itemFormData.image}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="specialNotes"
                    label="Special Notes"
                    fullWidth
                    value={itemFormData.specialNotes}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={itemFormData.isAvailable}
                        onChange={handleSwitchChange}
                        name="isAvailable"
                        color="primary"
                      />
                    }
                    label={itemFormData.isAvailable ? "Item Available" : "Item Unavailable"}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialogs}>Cancel</Button>
              <Button 
                onClick={handleUpdateMenuItem} 
                variant="contained" 
                color="primary"
              >
                Update Item
              </Button>
            </DialogActions>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog open={openDeleteDialog} onClose={handleCloseDialogs}>
            <DialogTitle>Delete Menu Item</DialogTitle>
            <DialogContent>
              <Typography>
                Are you sure you want to delete "{selectedItem?.name}"? This action cannot be undone.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialogs}>Cancel</Button>
              <Button 
                onClick={handleDeleteMenuItem} 
                variant="contained" 
                color="error"
              >
                Delete
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Container>
  );
};

export default ManageMenu;