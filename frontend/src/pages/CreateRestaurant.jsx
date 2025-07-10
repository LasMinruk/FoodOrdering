import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  MenuItem,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CUISINE_TYPES = [
  'Italian',
  'Chinese',
  'Indian',
  'Japanese',
  'Mexican',
  'Thai',
  'American',
  'Mediterranean',
  'Sri Lankan',
  'Fast Food',
  'Vegan',
  'Seafood',
  'Pizza',
  'Burger',
  'Dessert',
  'Beverage',
  'Other'
];

const CreateRestaurant = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [restaurantId, setRestaurantId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    contactNumber: '',
    cuisine: '',
    ownerId: currentUser?._id || '',
    description: '',
    openingHours: '',
    logo: '',
    bannerImage: ''
  });

  const steps = ['Basic Information', 'Additional Details', 'Images'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setActiveStep(prevStep => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prevStep => prevStep - 1);
  };

  const validateCurrentStep = () => {
    if (activeStep === 0) {
      return formData.name && formData.address && formData.contactNumber && formData.cuisine;
    } else if (activeStep === 1) {
      return formData.description && formData.openingHours;
    } else if (activeStep === 2) {
      return true; // add validation if logo/banner is required
    }
    return false;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        'http://localhost:5008/api/restaurant',
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      setRestaurantId(response.data._id);
      setSuccess(true);
      setLoading(false);

      setTimeout(() => {
        navigate('/restaurant/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Error creating restaurant:', err);
      setError(err.response?.data?.message || 'Failed to create restaurant');
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Create Your Restaurant
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4, mt: 2 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {success ? (
          <Alert severity="success" sx={{ mb: 3 }}>
            Restaurant created successfully! Redirecting to dashboard...
          </Alert>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        ) : null}

        <Box>
          {/* Step 1: Basic Information */}
          {activeStep === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Restaurant Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  required
                  fullWidth
                  label="Contact Number"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  required
                  fullWidth
                  select
                  label="Cuisine Type"
                  name="cuisine"
                  value={formData.cuisine}
                  onChange={handleChange}
                >
                  {CUISINE_TYPES.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          )}

          {/* Step 2: Additional Details */}
          {activeStep === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  multiline
                  rows={4}
                  label="Restaurant Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Opening Hours"
                  name="openingHours"
                  placeholder="e.g. Mon-Fri: 9AM-10PM, Sat-Sun: 10AM-11PM"
                  value={formData.openingHours}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
          )}

          {/* Step 3: Images */}
          {activeStep === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Logo URL"
                  name="logo"
                  value={formData.logo}
                  onChange={handleChange}
                  placeholder="https://example.com/logo.jpg"
                />
                <Typography variant="caption" color="text.secondary">
                  Enter URL for your restaurant logo (optional)
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Banner Image URL"
                  name="bannerImage"
                  value={formData.bannerImage}
                  onChange={handleChange}
                  placeholder="https://example.com/banner.jpg"
                />
                <Typography variant="caption" color="text.secondary">
                  Enter URL for your restaurant banner image (optional)
                </Typography>
              </Grid>
            </Grid>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              onClick={() => navigate('/restaurant/dashboard')}
              variant="outlined"
            >
              Cancel
            </Button>

            <Box>
              {activeStep > 0 && (
                <Button onClick={handleBack} sx={{ mr: 1 }}>
                  Back
                </Button>
              )}

              {activeStep < steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={!validateCurrentStep()}
                >
                  Next
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading || !validateCurrentStep()}
                >
                  {loading ? <CircularProgress size={24} /> : 'Create Restaurant'}
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default CreateRestaurant;
