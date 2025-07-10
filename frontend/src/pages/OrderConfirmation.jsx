import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { getOrderById } from '../services/orderService';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const data = await getOrderById(orderId);
        setOrder(data);
      } catch (err) {
        setError('Failed to load order details');
        toast.error('Could not load your order details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  // Helper function to format date
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Step animation
  const stepVariants = {
    active: { scale: 1.1, color: "#4F46E5", transition: { duration: 0.5 } },
    inactive: { scale: 1, color: "#9CA3AF", transition: { duration: 0.5 } },
    done: { scale: 1, color: "#10B981", transition: { duration: 0.5 } }
  };

  const getStepStatus = (status, step) => {
    const statusOrder = {
      'pending': 0,
      'confirmed': 1,
      'preparing': 2,
      'ready': 3, 
      'out_for_delivery': 4,
      'delivered': 5,
      'cancelled': -1
    };

    const currentStep = statusOrder[status] || 0;
    const stepValue = statusOrder[step] || 0;

    if (currentStep > stepValue) return "done";
    if (currentStep === stepValue) return "active";
    return "inactive";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white shadow-md rounded-lg p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-red-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <h2 className="mt-4 text-xl font-medium text-gray-900">Order Not Found</h2>
          <p className="mt-2 text-gray-500">
            We couldn't find the order you're looking for.
          </p>
          <div className="mt-6">
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
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
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
          <h1 className="text-3xl font-extrabold text-gray-900">Order Confirmed!</h1>
          <p className="mt-2 text-lg text-gray-600">
            Thank you for your order. Your order has been placed successfully.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Order #: <span className="font-medium">{order._id}</span>
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <motion.div 
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Order Status */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Order Status</h2>
              
              <div className="overflow-hidden">
                <div className="grid grid-cols-6">
                  <div className="col-span-6 flex items-center justify-between">
                    {/* Order Status Steps */}
                    <motion.div 
                      className="w-full px-6 flex justify-between relative"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                    >
                      {/* Progress Bar */}
                      <div className="absolute top-1/2 left-0 w-full h-1 -translate-y-1/2 bg-gray-200">
                        <motion.div 
                          className="h-full bg-indigo-600"
                          initial={{ width: "0%" }}
                          animate={{ 
                            width: order.status === 'pending' ? "5%" :
                                  order.status === 'confirmed' ? "20%" :
                                  order.status === 'preparing' ? "40%" :
                                  order.status === 'ready' ? "60%" :
                                  order.status === 'out_for_delivery' ? "80%" :
                                  order.status === 'delivered' ? "100%" : "5%"
                          }}
                          transition={{ duration: 0.8, delay: 0.5 }}
                        />
                      </div>
                      
                      {/* Step 1: Order Placed */}
                      <div className="flex flex-col items-center relative z-10">
                        <motion.div
                          variants={stepVariants}
                          initial="inactive"
                          animate={getStepStatus(order.status, 'pending')}
                          className="w-8 h-8 rounded-full border-2 border-gray-200 bg-white flex items-center justify-center"
                        >
                          {getStepStatus(order.status, 'pending') === "done" ? (
                            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <span className="text-xs font-medium">1</span>
                          )}
                        </motion.div>
                        <p className="mt-2 text-xs text-gray-500">Order Placed</p>
                      </div>
                      
                      {/* Step 2: Confirmed */}
                      <div className="flex flex-col items-center relative z-10">
                        <motion.div
                          variants={stepVariants}
                          initial="inactive"
                          animate={getStepStatus(order.status, 'confirmed')}
                          className="w-8 h-8 rounded-full border-2 border-gray-200 bg-white flex items-center justify-center"
                        >
                          {getStepStatus(order.status, 'confirmed') === "done" ? (
                            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <span className="text-xs font-medium">2</span>
                          )}
                        </motion.div>
                        <p className="mt-2 text-xs text-gray-500">Confirmed</p>
                      </div>
                      
                      {/* Step 3: Preparing */}
                      <div className="flex flex-col items-center relative z-10">
                        <motion.div
                          variants={stepVariants}
                          initial="inactive"
                          animate={getStepStatus(order.status, 'preparing')}
                          className="w-8 h-8 rounded-full border-2 border-gray-200 bg-white flex items-center justify-center"
                        >
                          {getStepStatus(order.status, 'preparing') === "done" ? (
                            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <span className="text-xs font-medium">3</span>
                          )}
                        </motion.div>
                        <p className="mt-2 text-xs text-gray-500">Preparing</p>
                      </div>
                      
                      {/* Step 4: Ready */}
                      <div className="flex flex-col items-center relative z-10">
                        <motion.div
                          variants={stepVariants}
                          initial="inactive"
                          animate={getStepStatus(order.status, 'ready')}
                          className="w-8 h-8 rounded-full border-2 border-gray-200 bg-white flex items-center justify-center"
                        >
                          {getStepStatus(order.status, 'ready') === "done" ? (
                            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <span className="text-xs font-medium">4</span>
                          )}
                        </motion.div>
                        <p className="mt-2 text-xs text-gray-500">Ready</p>
                      </div>
                      
                      {/* Step 5: Out for Delivery */}
                      <div className="flex flex-col items-center relative z-10">
                        <motion.div
                          variants={stepVariants}
                          initial="inactive"
                          animate={getStepStatus(order.status, 'out_for_delivery')}
                          className="w-8 h-8 rounded-full border-2 border-gray-200 bg-white flex items-center justify-center"
                        >
                          {getStepStatus(order.status, 'out_for_delivery') === "done" ? (
                            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <span className="text-xs font-medium">5</span>
                          )}
                        </motion.div>
                        <p className="mt-2 text-xs text-gray-500">Out for Delivery</p>
                      </div>
                      
                      {/* Step 6: Delivered */}
                      <div className="flex flex-col items-center relative z-10">
                        <motion.div
                          variants={stepVariants}
                          initial="inactive"
                          animate={getStepStatus(order.status, 'delivered')}
                          className="w-8 h-8 rounded-full border-2 border-gray-200 bg-white flex items-center justify-center"
                        >
                          {getStepStatus(order.status, 'delivered') === "done" ? (
                            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <span className="text-xs font-medium">6</span>
                          )}
                        </motion.div>
                        <p className="mt-2 text-xs text-gray-500">Delivered</p>
                      </div>
                    </motion.div>
                  </div>
                </div>
                
                <div className="mt-8">
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-sm text-blue-700">
                        {order.status === 'pending' && 'Your order has been received and is being processed.'}
                        {order.status === 'confirmed' && 'Your order has been confirmed. The restaurant is preparing your food.'}
                        {order.status === 'preparing' && 'The restaurant is currently preparing your delicious food.'}
                        {order.status === 'ready' && 'Your food is ready and waiting for a delivery partner.'}
                        {order.status === 'out_for_delivery' && 'Your food is on the way! It will arrive shortly.'}
                        {order.status === 'delivered' && 'Your food has been delivered. Enjoy your meal!'}
                        {order.status === 'cancelled' && 'This order has been cancelled.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Order Items</h2>
              <ul className="divide-y divide-gray-200">
                {order.items.map((item) => (
                  <li key={item._id || item.menuItemId} className="py-4 flex items-start">
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <div className="flex items-center">
                          <span className="font-medium text-gray-900">{item.quantity}x</span>
                          <span className="ml-2 text-gray-900">{item.name}</span>
                        </div>
                        <p className="text-sm font-medium text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  </li>
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
              
              <div className="border-t border-b border-gray-200 py-4">
                <div className="flex justify-between mb-2">
                  <p className="text-sm text-gray-600">Order Date</p>
                  <p className="text-sm font-medium text-gray-900">{formatDate(order.createdAt)}</p>
                </div>
                <div className="flex justify-between mb-2">
                  <p className="text-sm text-gray-600">Payment Method</p>
                  <p className="text-sm font-medium text-gray-900 capitalize">
                    {order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod}
                  </p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm text-gray-600">Delivery Address</p>
                  <p className="text-sm font-medium text-gray-900 text-right">
                    {order.deliveryAddress.addressLine1},
                    <br />
                    {order.deliveryAddress.addressLine2 && `${order.deliveryAddress.addressLine2}, `}
                    {order.deliveryAddress.homeTown}, {order.deliveryAddress.postalCode}
                  </p>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="flex justify-between mb-2">
                  <p className="text-sm text-gray-600">Subtotal</p>
                  <p className="text-sm font-medium text-gray-900">₹{(order.totalAmount - 40 - (order.totalAmount * 0.05)).toFixed(2)}</p>
                </div>
                <div className="flex justify-between mb-2">
                  <p className="text-sm text-gray-600">Delivery Fee</p>
                  <p className="text-sm font-medium text-gray-900">₹40.00</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm text-gray-600">Tax (5%)</p>
                  <p className="text-sm font-medium text-gray-900">₹{(order.totalAmount * 0.05).toFixed(2)}</p>
                </div>
                <div className="flex justify-between pt-4 border-t border-gray-200 mt-4">
                  <p className="text-base font-medium text-gray-900">Total</p>
                  <p className="text-base font-bold text-indigo-600">₹{order.totalAmount.toFixed(2)}</p>
                </div>
              </div>
              
              <div className="mt-8">
                <Link
                  to="/orders"
                  className="block text-center w-full bg-indigo-600 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none"
                >
                  View All Orders
                </Link>
                <Link
                  to="/"
                  className="block text-center w-full mt-4 text-indigo-600 hover:text-indigo-800"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;