import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { getRestaurantById } from '../services/restaurantService';

const CartPage = () => {
  const {
    cartItems = [], 
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotalPrice,
    restaurantId
  } = useCart();

  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRestaurantDetails = async () => {
      if (restaurantId) {
        try {
          setLoading(true);
          const data = await getRestaurantById(restaurantId);
          setRestaurant(data);
        } catch (error) {
          console.error('Failed to fetch restaurant details:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchRestaurantDetails();
  }, [restaurantId]);

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    updateQuantity(itemId, newQuantity);
  };

  const handleRemoveItem = (itemId) => {
    removeFromCart(itemId);
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to empty your cart?')) {
      clearCart();
    }
  };

  const proceedToCheckout = () => {
    navigate('/checkout');
  };

  console.log("Cart Items:", cartItems);

  // Calculate summary
  const subtotal = getTotalPrice?.() || 0;
  const deliveryFee = 40;
  const taxAmount = subtotal * 0.05;
  const total = subtotal + deliveryFee + taxAmount;

  console.log("Subtotal:", subtotal);
  console.log("Tax:", taxAmount);
  console.log("Total:", total);

  if (!Array.isArray(cartItems)) {
    return <div>Error loading cart. Please refresh.</div>;
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
          <h1 className="text-3xl font-extrabold text-gray-900">Your Cart</h1>
          {restaurant && (
            <p className="mt-2 text-lg text-gray-600">
              Items from <span className="font-medium text-indigo-600">{restaurant.name}</span>
            </p>
          )}
        </motion.div>

        {cartItems.length === 0 ? (
          <motion.div
            className="bg-white rounded-lg shadow-md p-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h2 className="mt-4 text-xl font-medium text-gray-900">Your cart is empty</h2>
            <p className="mt-2 text-gray-500">
              Looks like you haven't added any items to your cart yet.
            </p>
            <div className="mt-6">
              <Link
                to="/restaurants"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
              >
                Browse Restaurants
              </Link>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <motion.div
              className="lg:col-span-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="flex justify-between items-center px-6 py-4 bg-gray-50">
                  <h2 className="text-lg font-medium text-gray-900">Items ({cartItems.length})</h2>
                  <button
                    onClick={handleClearCart}
                    className="text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    Empty Cart
                  </button>
                </div>
                <ul className="divide-y divide-gray-200">
                  {cartItems.map((item, i) => (
                    <motion.li
                      key={item._id || i}
                      className="px-6 py-4 flex items-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md">
                        <img
                          src={item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex justify-between">
                          <h3 className="text-base font-medium text-gray-900">{item.name}</h3>
                          <p className="text-base font-medium text-gray-900">Rs. {(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                        <p className="mt-1 text-sm text-gray-500 line-clamp-1">{item.description}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center border rounded-md">
                            <button
                              onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                              className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                            >
                              -
                            </button>
                            <span className="px-3 py-1 text-gray-800">{item.quantity}</span>
                            <button
                              onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                              className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                            >
                              +
                            </button>
                          </div>
                          <button
                            onClick={() => handleRemoveItem(item._id)}
                            className="text-sm text-red-500 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </ul>
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
                <div className="flow-root">
                  <div className="border-t border-b border-gray-200 py-4">
                    <div className="flex justify-between mb-2">
                      <p className="text-sm text-gray-600">Subtotal</p>
                      <p className="text-sm font-medium text-gray-900">Rs. {subtotal.toFixed(2)}</p>
                    </div>
                    <div className="flex justify-between mb-2">
                      <p className="text-sm text-gray-600">Delivery Fee</p>
                      <p className="text-sm font-medium text-gray-900">Rs. {deliveryFee.toFixed(2)}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-sm text-gray-600">Tax (5%)</p>
                      <p className="text-sm font-medium text-gray-900">Rs. {taxAmount.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex justify-between pt-4">
                    <p className="text-base font-medium text-gray-900">Total</p>
                    <p className="text-base font-medium text-gray-900">Rs. {total.toFixed(2)}</p>
                  </div>
                </div>
                <div className="mt-6">
                  <motion.button
                    onClick={proceedToCheckout}
                    className="w-full bg-indigo-600 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Proceed to Checkout
                  </motion.button>
                </div>
                <div className="mt-4">
                  <Link
                    to={`/restaurants${restaurantId ? `/${restaurantId}` : ''}`}
                    className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                    </svg>
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
