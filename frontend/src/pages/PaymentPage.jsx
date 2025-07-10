import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
  TextField,
  RadioGroup,
  Radio,
  FormControlLabel,
  FormControl,
  FormLabel,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Divider
} from '@mui/material';
import { 
  CreditCard, 
  CheckCircleOutline,
  Payment as PaymentIcon
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const PaymentPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { orderId, orderDetails } = location.state || {};
  
  const [activeStep, setActiveStep] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: ''
  });
  const [paymentId, setPaymentId] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    if (!orderId || !orderDetails) {
      navigate('/checkout');
      return;
    }
  }, [currentUser, orderId, orderDetails, navigate]);

  const handlePaymentMethodChange = (event) => {
    setPaymentMethod(event.target.value);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setPaymentDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProceedToPayment = () => {
    setActiveStep(1);
  };

  const validatePaymentDetails = () => {
    if (paymentMethod === 'stripe') {
      // Simple validation for card details
      return (
        paymentDetails.cardNumber.replace(/\s/g, '').length === 16 &&
        paymentDetails.expiryDate.length === 5 &&
        paymentDetails.cvv.length === 3 &&
        paymentDetails.nameOnCard.trim() !== ''
      );
    }
    return true;
  };

  const formatCardNumber = (value) => {
    // Format card number as 4 digits groups (1234 5678 9012 3456)
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    
    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const handleCardNumberChange = (event) => {
    const formattedValue = formatCardNumber(event.target.value);
    setPaymentDetails(prev => ({
      ...prev,
      cardNumber: formattedValue
    }));
  };

  const handleExpiryDateChange = (event) => {
    let value = event.target.value;
    value = value.replace(/[^\d]/g, '');
    
    if (value.length <= 2) {
      setPaymentDetails(prev => ({
        ...prev,
        expiryDate: value
      }));
    } else if (value.length > 2) {
      setPaymentDetails(prev => ({
        ...prev,
        expiryDate: `${value.slice(0, 2)}/${value.slice(2, 4)}`
      }));
    }
  };

  const handleProcessPayment = async () => {
    if (!validatePaymentDetails()) {
      setError('Please enter valid payment details');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create payment with the payment service
      const response = await axios.post(
        'http://localhost:5004/api/payments/create',
        {
          orderId: orderId,
          userId: currentUser._id,
          amount: orderDetails.totalAmount,
          paymentMethod: paymentMethod
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      setPaymentId(response.data.payment._id);
      
      // Simulate payment processing
      // In a real app, you would integrate with Stripe or other payment gateways
      setTimeout(async () => {
        try {
          // Confirm payment
          await axios.put(
            `http://localhost:5004/api/payments/confirm/${response.data.payment._id}`,
            {
              message: 'Payment confirmed',
              payment: { status: 'completed' }
            },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
              }
            }
          );
          
          setPaymentSuccess(true);
          setActiveStep(2);
        } catch (confirmError) {
          console.error('Error confirming payment:', confirmError);
          setError('Failed to process payment. Please try again.');
        } finally {
          setLoading(false);
        }
      }, 2000); // Simulate 2 seconds processing time

    } catch (err) {
      console.error('Error creating payment:', err);
      setError(err.response?.data?.message || 'Failed to process payment');
      setLoading(false);
    }
  };

  const handleViewOrderDetails = () => {
    navigate(`/order-confirmation/${orderId}`);
  };

  const steps = ['Payment Method', 'Payment Details', 'Confirmation'];

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Payment
        </Typography>

        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mt: 2 }}>
          {/* Step 1: Payment Method */}
          {activeStep === 0 && (
            <>
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Order Summary
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Order #{orderId.substring(orderId.length - 6)}
                      </Typography>
                    </Grid>
                    
                    {orderDetails.items?.map((item, index) => (
                      <Grid item xs={12} key={index}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body1">
                            {item.name} x {item.quantity}
                          </Typography>
                          <Typography variant="body1">
                            Rs. {Number(item.price * item.quantity).toLocaleString('en-LK', { minimumFractionDigits: 2 })} LKR
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                    
                    <Grid item xs={12}>
                      <Divider sx={{ my: 1 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          Total Amount:
                        </Typography>
                        <Typography variant="subtitle1" fontWeight="bold">
                          Rs. {Number(orderDetails.totalAmount).toLocaleString('en-LK', { minimumFractionDigits: 2 })} LKR
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              <FormControl component="fieldset">
                <FormLabel component="legend">Select Payment Method</FormLabel>
                <RadioGroup
                  value={paymentMethod}
                  onChange={handlePaymentMethodChange}
                  name="payment-method-group"
                >
                  <FormControlLabel 
                    value="stripe" 
                    control={<Radio />} 
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CreditCard sx={{ mr: 1 }} />
                        <Typography>Credit / Debit Card</Typography>
                      </Box>
                    } 
                  />
                  <FormControlLabel 
                    value="cash" 
                    control={<Radio />} 
                    label="Cash on Delivery" 
                  />
                </RadioGroup>
              </FormControl>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate(-1)}
                >
                  Back to Checkout
                </Button>
                <Button
                  variant="contained"
                  onClick={handleProceedToPayment}
                >
                  Proceed to Payment
                </Button>
              </Box>
            </>
          )}

          {/* Step 2: Payment Details */}
          {activeStep === 1 && (
            <>
              {paymentMethod === 'stripe' ? (
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      label="Card Number"
                      name="cardNumber"
                      value={paymentDetails.cardNumber}
                      onChange={handleCardNumberChange}
                      placeholder="1234 5678 9012 3456"
                      inputProps={{ maxLength: 19 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      label="Expiry Date"
                      name="expiryDate"
                      value={paymentDetails.expiryDate}
                      onChange={handleExpiryDateChange}
                      placeholder="MM/YY"
                      inputProps={{ maxLength: 5 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      label="CVV"
                      name="cvv"
                      type="password"
                      value={paymentDetails.cvv}
                      onChange={handleInputChange}
                      placeholder="123"
                      inputProps={{ maxLength: 3 }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      label="Name on Card"
                      name="nameOnCard"
                      value={paymentDetails.nameOnCard}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                    />
                  </Grid>
                </Grid>
              ) : (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Cash on Delivery
                  </Typography>
                  <Typography variant="body1" paragraph>
                    You will pay Rs. {Number(orderDetails.totalAmount).toLocaleString('en-LK', { minimumFractionDigits: 2 })} LKR when your order is delivered.
                  </Typography>
                </Box>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button
                  variant="outlined"
                  onClick={() => setActiveStep(0)}
                  disabled={loading}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={handleProcessPayment}
                  disabled={loading || (paymentMethod === 'stripe' && !validatePaymentDetails())}
                >
                  {loading ? (
                    <CircularProgress size={24} sx={{ mr: 1 }} />
                  ) : (
                    <>Process Payment</>
                  )}
                </Button>
              </Box>
            </>
          )}

          {/* Step 3: Confirmation */}
          {activeStep === 2 && paymentSuccess && (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <CheckCircleOutline sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Payment Successful!
              </Typography>
              <Typography variant="body1" paragraph>
                Your payment of Rs. {Number(orderDetails.totalAmount).toLocaleString('en-LK', { minimumFractionDigits: 2 })} LKR has been processed successfully.
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Payment ID: {paymentId}
              </Typography>
              <Button
                variant="contained"
                onClick={handleViewOrderDetails}
                sx={{ mt: 2 }}
              >
                View Order Details
              </Button>
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default PaymentPage;