import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getAllRestaurants } from '../services/restaurantService';

const RestaurantsPage = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    searchQuery: '',
    cuisine: 'all',
    sortBy: 'rating'
  });

  const cuisineOptions = [
    'all',
    'Indian',
    'Italian',
    'Chinese',
    'Japanese',
    'Mexican',
    'Thai',
    'American',
    'Fast Food',
    'Pizza',
    'Healthy',
    'Vegetarian',
    'Vegan',
    'Desserts'
  ];

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        const data = await getAllRestaurants();
        setRestaurants(data);
        setFilteredRestaurants(data);
      } catch (err) {
        setError('Failed to load restaurants');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  useEffect(() => {
    // Apply filters whenever filters change
    let result = [...restaurants];
    
    // Apply search query filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(
        restaurant => 
          restaurant.name.toLowerCase().includes(query) || 
          restaurant.cuisine?.toLowerCase().includes(query) ||
          restaurant.address?.toLowerCase().includes(query)
      );
    }
    
    // Apply cuisine filter
    if (filters.cuisine !== 'all') {
      result = result.filter(
        restaurant => restaurant.cuisine === filters.cuisine
      );
    }
    
    // Apply sorting
    if (filters.sortBy === 'rating') {
      result = result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (filters.sortBy === 'name') {
      result = result.sort((a, b) => a.name.localeCompare(b.name));
    }
    
    setFilteredRestaurants(result);
  }, [restaurants, filters]);

  const handleSearchChange = (e) => {
    setFilters({
      ...filters,
      searchQuery: e.target.value
    });
  };

  const handleCuisineChange = (e) => {
    setFilters({
      ...filters,
      cuisine: e.target.value
    });
  };

  const handleSortChange = (e) => {
    setFilters({
      ...filters,
      sortBy: e.target.value
    });
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-extrabold text-gray-900">Restaurants</h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Find your favorite restaurants and cuisines
          </p>
        </motion.div>

        <motion.div 
          className="mt-8 bg-white p-6 rounded-lg shadow-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Search Input */}
            <div className="w-full md:w-1/3">
              <label htmlFor="search" className="sr-only">
                Search Restaurants
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path 
                      fillRule="evenodd" 
                      clipRule="evenodd" 
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" 
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  name="search"
                  id="search"
                  value={filters.searchQuery}
                  onChange={handleSearchChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Search for restaurants..."
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              {/* Cuisine Filter */}
              <div className="w-full sm:w-auto">
                <label htmlFor="cuisine-filter" className="sr-only">
                  Cuisine Filter
                </label>
                <select
                  id="cuisine-filter"
                  name="cuisine-filter"
                  value={filters.cuisine}
                  onChange={handleCuisineChange}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  {cuisineOptions.map((cuisine) => (
                    <option key={cuisine} value={cuisine}>
                      {cuisine === 'all' ? 'All Cuisines' : cuisine}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div className="w-full sm:w-auto">
                <label htmlFor="sort-by" className="sr-only">
                  Sort By
                </label>
                <select
                  id="sort-by"
                  name="sort-by"
                  value={filters.sortBy}
                  onChange={handleSortChange}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="rating">Rating (High to Low)</option>
                  <option value="name">Name (A-Z)</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Restaurant List */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : error ? (
          <div className="mt-8 text-center text-red-500">{error}</div>
        ) : filteredRestaurants.length === 0 ? (
          <div className="mt-8 text-center text-gray-500">
            <p>No restaurants found matching your criteria.</p>
            <button
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={() => setFilters({
                searchQuery: '',
                cuisine: 'all',
                sortBy: 'rating'
              })}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <motion.div
            className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {filteredRestaurants.map((restaurant) => (
              <motion.div
                key={restaurant._id}
                className="bg-white overflow-hidden shadow-md rounded-lg cursor-pointer hover:shadow-lg transition-shadow duration-300"
                variants={item}
                whileHover={{ y: -5 }}
              >
                <Link to={`/restaurants/${restaurant._id}`}>
                  <div className="relative h-48">
                    <img
                      src={restaurant.bannerImage || restaurant.logo || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60"}
                      alt={restaurant.name}
                      className="h-full w-full object-cover"
                    />
                    {restaurant.isAvailable === false && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">Currently Unavailable</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-900">{restaurant.name}</h3>
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="ml-1 text-sm font-medium text-gray-600">{restaurant.rating?.toFixed(1) || "4.5"}</span>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">{restaurant.cuisine || "Various Cuisines"}</p>
                    <p className="mt-1 text-sm text-gray-500">{restaurant.address || "Local Area"}</p>
                    
                    <div className="mt-4 flex items-center">
                      <span className="text-sm text-gray-600">
                        {restaurant.isAvailable !== false ? "Open Now" : "Closed"}
                      </span>
                      <span className="mx-2 text-gray-500">•</span>
                      <span className="text-sm text-gray-600">
                        {restaurant.deliveryTime || "30-45 min"}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default RestaurantsPage;