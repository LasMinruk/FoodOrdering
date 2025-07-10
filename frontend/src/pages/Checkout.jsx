import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../services/orderService';
import { createPayment } from '../services/paymentService';

const Checkout = () => {
  const { cartItems, getTotalPrice, clearCart, restaurant } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    addressLine1: '',
    addressLine2: '',
    homeTown: '',
    postalCode: '',
    label: 'Home'
  });

  // Payment options state
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvc: ''
  });

  console.log("check user,", currentUser);
  const userId = currentUser ? currentUser._id : null;

  const restaurantId = restaurant?.id || restaurant?._id;
  console.log("Restaurant object:", restaurant);
  console.log("Restaurant ID:", restaurantId);


  // Order notes
  const [orderNotes, setOrderNotes] = useState('');

  // Calculate order summary
  const subtotal = getTotalPrice?.() || 0;
  const deliveryFee = 40;
  const taxAmount = subtotal * 0.05; // 5% tax
  const total = subtotal + deliveryFee + taxAmount;

  useEffect(() => {
    // Redirect to cart if cart is empty
    if (cartItems.length === 0) {
      navigate('/cart');
      return;
    }

    // Set default address if user has addresses
    if (currentUser?.address && currentUser.address.length > 0) {
      setSelectedAddress(currentUser.address[0]);
    }
  }, [cartItems, currentUser, navigate]);

  const handleChangeAddress = (address) => {
    setSelectedAddress(address);
    setShowAddressForm(false);
  };

  const handleAddressInputChange = (e) => {
    const { name, value } = e.target;
    setNewAddress({
      ...newAddress,
      [name]: value
    });
  };

  const handleCardDetailsChange = (e) => {
    const { name, value } = e.target;
    setCardDetails({
      ...cardDetails,
      [name]: value
    });
  };

  const addNewAddress = () => {
    // Validation
    if (!newAddress.addressLine1 || !newAddress.homeTown || !newAddress.postalCode) {
      toast.error('Please fill in all required address fields');
      return;
    }

    // Create new address object
    const address = { ...newAddress };
    setSelectedAddress(address);
    setShowAddressForm(false);
    
    // In a real app, we would also save this to the user profile
    toast.success('New address added');
  };

  const validateForm = () => {
    if (!selectedAddress) {
      toast.error('Please select a delivery address');
      return false;
    }

    if (paymentMethod === 'card') {
      if (!cardDetails.cardNumber || !cardDetails.cardName || !cardDetails.expiry || !cardDetails.cvc) {
        toast.error('Please fill in all card details');
        return false;
      }
      
      // Basic card validation
      if (!/^\d{16}$/.test(cardDetails.cardNumber.replace(/\s/g, ''))) {
        toast.error('Please enter a valid 16-digit card number');
        return false;
      }
    }

    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);

      // Create order object
      const orderData = {
        restaurantId: restaurantId,
        customerId: userId,
        items: cartItems.map(item => ({
          menuItemId: item._id,
          quantity: item.quantity,
          price: item.price,
          name: item.name
        })),
        totalAmount: total,
        deliveryAddress: {
          addressLine1: selectedAddress.addressLine1,
          addressLine2: selectedAddress.addressLine2 || '',
          homeTown: selectedAddress.homeTown,
          postalCode: selectedAddress.postalCode
        },
        paymentMethod,
        orderNotes,
        status: paymentMethod === 'cod' ? 'pending' : 'processing'
      };

      // Make payment if card payment
      if (paymentMethod === 'card') {
        // Process payment
        const paymentData = {
          amount: total,
          currency: 'INR',
          paymentMethod: 'card',
          cardDetails: {
            cardNumber: cardDetails.cardNumber,
            cardName: cardDetails.cardName,
            expiry: cardDetails.expiry,
            cvc: cardDetails.cvc
          }
        };

        const paymentResponse = await createPayment(paymentData);
        orderData.paymentId = paymentResponse.paymentId;
      }

      // Create order
      const order = await createOrder(orderData);
      
      // Clear cart and redirect to confirmation page
      clearCart();
      navigate(`/order-confirmation/${order._id}`);
      
      toast.success('Order placed successfully!');
    } catch (error) {
      toast.error('Failed to place order. Please try again.');
      console.error('Order placement error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return null; // This will be caught by the useEffect and redirect
  }

  return (
    <div className="bg-gray-100 py-8 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-extrabold text-gray-900">Checkout</h1>
          <p className="mt-2 text-lg text-gray-600">
            Complete your order
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main checkout form */}
          <motion.div 
            className="lg:col-span-2 space-y-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Delivery address */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Delivery Address</h2>
              
              {!showAddressForm && currentUser?.address && currentUser.address.length > 0 ? (
                <div className="space-y-4">
                  {currentUser.address.map((address, index) => (
                    <div 
                      key={index}
                      className={`border rounded-lg p-4 cursor-pointer ${selectedAddress === address ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'}`}
                      onClick={() => handleChangeAddress(address)}
                    >
                      <div className="flex justify-between">
                        <div className="flex items-center">
                          <input
                            type="radio"
                            checked={selectedAddress === address}
                            onChange={() => handleChangeAddress(address)}
                            className="h-4 w-4 text-indigo-600"
                          />
                          <span className="ml-3 text-sm font-medium text-gray-900">
                            {address.label || 'Address'} {index + 1}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-gray-500 ml-7">
                        <p>{address.addressLine1}</p>
                        {address.addressLine2 && <p>{address.addressLine2}</p>}
                        <p>{address.homeTown}, {address.postalCode}</p>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(true)}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add a new address
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-6 gap-4">
                    <div className="col-span-6">
                      <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700">Address Line 1</label>
                      <input
                        type="text"
                        name="addressLine1"
                        id="addressLine1"
                        value={newAddress.addressLine1}
                        onChange={handleAddressInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div className="col-span-6">
                      <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700">Address Line 2 (Optional)</label>
                      <input
                        type="text"
                        name="addressLine2"
                        id="addressLine2"
                        value={newAddress.addressLine2}
                        onChange={handleAddressInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="homeTown" className="block text-sm font-medium text-gray-700">City / Town</label>
                      <input
                        type="text"
                        name="homeTown"
                        id="homeTown"
                        value={newAddress.homeTown}
                        onChange={handleAddressInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">Postal Code</label>
                      <input
                        type="text"
                        name="postalCode"
                        id="postalCode"
                        value={newAddress.postalCode}
                        onChange={handleAddressInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="label" className="block text-sm font-medium text-gray-700">Save as</label>
                      <select
                        name="label"
                        id="label"
                        value={newAddress.label}
                        onChange={handleAddressInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      >
                        <option value="Home">Home</option>
                        <option value="Work">Work</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={addNewAddress}
                      className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                    >
                      Save Address
                    </button>
                    {currentUser?.address && currentUser.address.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowAddressForm(false)}
                        className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Payment method */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Payment Method</h2>
              
              <div className="space-y-4">
                <div
                  className={`border rounded-lg p-4 cursor-pointer ${paymentMethod === 'card' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'}`}
                  onClick={() => setPaymentMethod('card')}
                >
                  <div className="flex items-center">
                    <input
                      id="card-payment"
                      name="paymentMethod"
                      type="radio"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="h-4 w-4 text-indigo-600"
                    />
                    <label htmlFor="card-payment" className="ml-3 block text-sm font-medium text-gray-700">
                      Credit/Debit Card
                    </label>
                  </div>
                  
                  {paymentMethod === 'card' && (
                    <div className="mt-4 grid grid-cols-6 gap-4">
                      <div className="col-span-6">
                        <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">Card Number</label>
                        <input
                          type="text"
                          name="cardNumber"
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={cardDetails.cardNumber}
                          onChange={handleCardDetailsChange}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>
                      <div className="col-span-6">
                        <label htmlFor="cardName" className="block text-sm font-medium text-gray-700">Name on Card</label>
                        <input
                          type="text"
                          name="cardName"
                          id="cardName"
                          value={cardDetails.cardName}
                          onChange={handleCardDetailsChange}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>
                      <div className="col-span-3">
                        <label htmlFor="expiry" className="block text-sm font-medium text-gray-700">Expiry Date (MM/YY)</label>
                        <input
                          type="text"
                          name="expiry"
                          id="expiry"
                          placeholder="MM/YY"
                          value={cardDetails.expiry}
                          onChange={handleCardDetailsChange}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>
                      <div className="col-span-3">
                        <label htmlFor="cvc" className="block text-sm font-medium text-gray-700">CVC</label>
                        <input
                          type="text"
                          name="cvc"
                          id="cvc"
                          placeholder="123"
                          value={cardDetails.cvc}
                          onChange={handleCardDetailsChange}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                <div
                  className={`border rounded-lg p-4 cursor-pointer ${paymentMethod === 'cod' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'}`}
                  onClick={() => setPaymentMethod('cod')}
                >
                  <div className="flex items-center">
                    <input
                      id="cod-payment"
                      name="paymentMethod"
                      type="radio"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="h-4 w-4 text-indigo-600"
                    />
                    <label htmlFor="cod-payment" className="ml-3 block text-sm font-medium text-gray-700">
                      Cash on Delivery
                    </label>
                  </div>
                  {paymentMethod === 'cod' && (
                    <p className="text-sm text-gray-500 mt-2 ml-7">
                      Pay with cash upon delivery. Please have the exact amount ready.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Order Notes */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Order Notes (Optional)</h2>
              <textarea
                rows={3}
                name="orderNotes"
                id="orderNotes"
                placeholder="Special instructions for delivery or food preparation..."
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </motion.div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Order Summary</h2>
              
              {/* Items */}
              <div className="max-h-64 overflow-y-auto mb-4">
                {cartItems.map((item) => (
                  <div key={item._id} className="flex py-2 border-b border-gray-200 last:border-b-0">
                    <span className="text-gray-600 mr-2">{item.quantity}x</span>
                    <span className="flex-1 text-sm font-medium text-gray-900">{item.name}</span>
                    <span className="text-sm font-medium text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              {/* Summary */}
              <div className="flow-root">
                <div className="border-t border-b border-gray-200 py-4">
                  <div className="flex justify-between mb-2">
                    <p className="text-sm text-gray-600">Subtotal</p>
                    <p className="text-sm font-medium text-gray-900">₹{subtotal.toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between mb-2">
                    <p className="text-sm text-gray-600">Delivery Fee</p>
                    <p className="text-sm font-medium text-gray-900">₹{deliveryFee.toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-sm text-gray-600">Tax (5%)</p>
                    <p className="text-sm font-medium text-gray-900">₹{taxAmount.toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex justify-between py-4">
                  <p className="text-base font-medium text-gray-900">Total</p>
                  <p className="text-base font-bold text-indigo-600">₹{total.toFixed(2)}</p>
                </div>
              </div>
              
              {/* Checkout button */}
              <div className="mt-6">
                <motion.button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="w-full bg-indigo-600 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <div className="flex justify-center items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    'Place Order'
                  )}
                </motion.button>
              </div>
              
              <p className="mt-4 text-sm text-gray-500 text-center">
                By placing your order, you agree to our{' '}
                <a href="#" className="text-indigo-600 hover:text-indigo-800">
                  Terms & Conditions
                </a>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;