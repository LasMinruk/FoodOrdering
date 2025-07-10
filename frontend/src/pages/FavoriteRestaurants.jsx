import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  IconButton,
  CircularProgress,
  Alert,
  Divider,
  Rating
} from '@mui/material';
import { 
  Favorite, 
  FavoriteBorder,
  Restaurant as RestaurantIcon,
  Delete
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const FavoriteRestaurants = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    fetchFavorites();
  }, [currentUser, navigate]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch the list of favorite restaurant IDs
      const response = await axios.get(
        'http://localhost:5007/api/auth/favorites',
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      const favoriteIds = response.data.favoriteRestaurants || [];
      if (favoriteIds.length > 0) {
        const restaurantDetails = await Promise.all(
          favoriteIds.map(async (id) => {
            const res = await axios.get(`http://localhost:5008/api/restaurant/${id}`);
            return res.data; 
          })
        );
        
        setFavorites(restaurantDetails); 
      } else {
        setFavorites([]); 
      }
  
      setLoading(false);
    } catch (err) {
      console.error('Error fetching favorites:', err);
      setError('Failed to load favorite restaurants');
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (restaurantId) => {
    try {
      await axios.delete(
        `http://localhost:5007/api/auth/favorites/${restaurantId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      // Update local state
      setFavorites(favorites.filter(restaurant => restaurant._id !== restaurantId));
    } catch (err) {
      console.error('Error removing favorite:', err);
      alert('Failed to remove favorite');
    }
  };

  const handleViewDetails = (restaurantId) => {
    navigate(`/restaurants/${restaurantId}`);
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Button variant="contained" onClick={fetchFavorites}>
            Try Again
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Your Favorite Restaurants
        </Typography>
        
        <Divider sx={{ mb: 3 }} />
        
        {favorites.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 5 }}>
            <RestaurantIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5 }} />
            <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
              You haven't added any restaurants to your favorites yet
            </Typography>
            <Button 
              variant="contained"
              sx={{ mt: 2 }}
              onClick={() => navigate('/restaurants')}
            >
              Browse Restaurants
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {favorites.map((restaurant) => (
              <Grid item xs={12} sm={6} md={4} key={restaurant._id}>
                <Card 
                  elevation={2}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative'
                  }}
                >
                  <IconButton
                    sx={{ 
                      position: 'absolute', 
                      top: 8, 
                      right: 8,
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      }
                    }}
                    onClick={() => handleRemoveFavorite(restaurant._id)}
                    aria-label="remove from favorites"
                  >
                    <Delete color="error" />
                  </IconButton>

                  <CardMedia
                    component="img"
                    height="160"
                    image={restaurant.bannerImage || 'https://via.placeholder.com/300x160?text=Restaurant'}
                    alt={restaurant.name}
                  />
                  
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography gutterBottom variant="h6" component="div">
                        {restaurant.name}
                      </Typography>
                      <Favorite color="error" />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {restaurant.cuisine}
                    </Typography>
                    
                    {restaurant.averageRating && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Rating 
                          value={restaurant.averageRating} 
                          readOnly 
                          precision={0.5}
                          size="small"
                        />
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                          ({restaurant.totalReviews || 0} reviews)
                        </Typography>
                      </Box>
                    )}
                    
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {restaurant.address}
                    </Typography>
                  </CardContent>
                  
                  <CardActions>
                    <Button 
                      size="small" 
                      variant="contained"
                      fullWidth
                      onClick={() => handleViewDetails(restaurant._id)}
                    >
                      View Menu
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
    </Container>
  );
};

export default FavoriteRestaurants;
