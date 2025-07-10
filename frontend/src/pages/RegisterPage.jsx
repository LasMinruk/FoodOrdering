import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { register } from '../services/authService';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    homeTown: '',
    postalCode: '',
    role: 'customer' // Default role
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  const validateForm = () => {
    let tempErrors = {};
    
    if (!formData.name) tempErrors.name = 'Name is required';
    
    if (!formData.email) {
      tempErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      tempErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      tempErrors.password = 'Password must be at least 8 characters';
    }
    
    if (!formData.confirmPassword) {
      tempErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      tempErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.phone) tempErrors.phone = 'Phone number is required';
    
    if (!formData.addressLine1) tempErrors.addressLine1 = 'Address is required';
    if (!formData.homeTown) tempErrors.homeTown = 'City is required';
    if (!formData.postalCode) tempErrors.postalCode = 'Postal code is required';
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        // Format the data for the API
        const userData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          address: [
            {
              addressLine1: formData.addressLine1,
              addressLine2: formData.addressLine2,
              homeTown: formData.homeTown,
              postalCode: formData.postalCode
            }
          ],
          role: formData.role
        };
        
        await register(userData);
        toast.success('Registration successful! Please sign in.');
        navigate('/login');
      } catch (error) {
        toast.error(error.message || 'Failed to register. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        className="max-w-md mx-auto"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-center text-3xl font-extrabold text-gray-900">Create your account</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign in
          </Link>
        </p>
      </motion.div>

      <motion.div
        className="mt-8 max-w-md mx-auto bg-white p-8 rounded-lg shadow-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
            <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
              <div className="sm:col-span-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full name
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name}</p>}
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    } rounded-md`}
                  />
                  {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    type="password"
                    name="password"
                    id="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm ${
                      errors.password ? 'border-red-300' : 'border-gray-300'
                    } rounded-md`}
                  />
                  {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <div className="mt-1">
                  <input
                    type="password"
                    name="confirmPassword"
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm ${
                      errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                    } rounded-md`}
                  />
                  {errors.confirmPassword && (
                    <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone number
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="phone"
                    id="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm ${
                      errors.phone ? 'border-red-300' : 'border-gray-300'
                    } rounded-md`}
                  />
                  {errors.phone && <p className="mt-2 text-sm text-red-600">{errors.phone}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900">Address</h3>
            <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
              <div className="sm:col-span-2">
                <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700">
                  Address Line 1
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="addressLine1"
                    id="addressLine1"
                    value={formData.addressLine1}
                    onChange={handleChange}
                    className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm ${
                      errors.addressLine1 ? 'border-red-300' : 'border-gray-300'
                    } rounded-md`}
                  />
                  {errors.addressLine1 && (
                    <p className="mt-2 text-sm text-red-600">{errors.addressLine1}</p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700">
                  Address Line 2 (Optional)
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="addressLine2"
                    id="addressLine2"
                    value={formData.addressLine2}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="homeTown" className="block text-sm font-medium text-gray-700">
                  City / Town
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="homeTown"
                    id="homeTown"
                    value={formData.homeTown}
                    onChange={handleChange}
                    className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm ${
                      errors.homeTown ? 'border-red-300' : 'border-gray-300'
                    } rounded-md`}
                  />
                  {errors.homeTown && <p className="mt-2 text-sm text-red-600">{errors.homeTown}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
                  Postal code
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="postalCode"
                    id="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm ${
                      errors.postalCode ? 'border-red-300' : 'border-gray-300'
                    } rounded-md`}
                  />
                  {errors.postalCode && (
                    <p className="mt-2 text-sm text-red-600">{errors.postalCode}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* User Type Selection */}
          <div>
            <h3 className="text-lg font-medium text-gray-900">Account Type</h3>
            <div className="mt-4">
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    id="role-customer"
                    name="role"
                    type="radio"
                    value="customer"
                    checked={formData.role === 'customer'}
                    onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <label htmlFor="role-customer" className="ml-3 block text-sm font-medium text-gray-700">
                    Customer
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="role-restaurant_admin"
                    name="role"
                    type="radio"
                    value="restaurant_admin"
                    checked={formData.role === 'restaurant_admin'}
                    onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <label htmlFor="role-restaurant_admin" className="ml-3 block text-sm font-medium text-gray-700">
                    Restaurant Owner
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="role-delivery_person"
                    name="role"
                    type="radio"
                    value="delivery_person"
                    checked={formData.role === 'delivery_person'}
                    onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <label htmlFor="role-delivery_person" className="ml-3 block text-sm font-medium text-gray-700">
                    Delivery Driver
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div>
            <motion.button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSubmitting ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : null}
              {isSubmitting ? 'Creating account...' : 'Create Account'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default RegisterPage;