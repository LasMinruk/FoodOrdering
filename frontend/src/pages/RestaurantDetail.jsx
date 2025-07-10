import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { getRestaurantById } from '../services/restaurantService';
import {
  addToFavorites,
  removeFromFavorites,
  getFavoriteRestaurants
} from '../services/favoriteService';
import { useCart } from '../context/CartContext';

const RestaurantDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [restaurant, setRestaurant] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        setLoading(true);
        const data = await getRestaurantById(id);
        setRestaurant(data);

        if (data.menu && data.menu.length > 0) {
          const categories = [...new Set(data.menu.map(item => item.category))];
          if (categories.length > 0) {
            setActiveCategory(categories[0]);
          }
        }
      } catch (err) {
        setError('Failed to load restaurant details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const fetchFavoriteStatus = async () => {
      try {
        const response = await getFavoriteRestaurants();
        const favorites = response.favoriteRestaurants || [];
        console.log('Favorites Response:', favorites);
        setIsFavorite(favorites.some(fav => fav === id));
      } catch (error) {
        console.error('Failed to fetch favorites', error);
        setIsFavorite(false);
      }
    };

    fetchRestaurant();
    fetchFavoriteStatus();
  }, [id]);

  const handleAddToCart = (menuItem) => {
    addToCart(menuItem, restaurant);
    toast.success(`Added ${menuItem.name} to cart!`);
  };

  const toggleFavorite = async () => {
    try {
      if (isFavorite) {
        await removeFromFavorites(restaurant._id);
        setIsFavorite(false);
        toast.success('Removed from favorites');
      } else {
        await addToFavorites(restaurant._id);
        setIsFavorite(true);
        toast.success('Added to favorites');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorites');
    }
  };

  const getMenuCategories = () => {
    if (!restaurant || !restaurant.menu) return [];
    return [...new Set(restaurant.menu.map(item => item.category))];
  };

  const getMenuItemsByCategory = (category) => {
    if (!restaurant || !restaurant.menu) return [];
    return restaurant.menu.filter(item => item.category === category);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-gray-500 text-xl">Restaurant not found</div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* Modern Split Hero Section */}
      <div className="flex flex-col md:flex-row items-stretch w-full min-h-[350px]">
        {/* Left: Info */}
        <div className="flex-1 flex flex-col justify-center px-8 py-10 bg-indigo-600 rounded-b-3xl md:rounded-none md:rounded-l-3xl text-white min-h-[350px] shadow-xl border-r-2 border-indigo-700/30">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-2 drop-shadow-lg">{restaurant.name}</h1>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-block bg-yellow-400 text-indigo-900 font-semibold px-3 py-1 rounded-full text-xs uppercase tracking-wide shadow-sm">
              {restaurant.cuisine || 'Cuisine'}
            </span>
          </div>
          <div className="flex items-center mb-2">
            {[...Array(Math.floor(restaurant.rating || 4))].map((_, i) => (
              <svg key={i} className="w-6 h-6 text-yellow-300 drop-shadow" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="ml-3 text-lg font-bold">{restaurant.rating || "4.5"}</span>
            <span className="mx-3 text-white/70">•</span>
            <span className={restaurant.isAvailable !== false ? "text-green-300 font-semibold" : "text-red-200 font-semibold"}>
              {restaurant.isAvailable !== false ? "Open Now" : "Closed"}
            </span>
          </div>
          <div className="mt-3 text-indigo-100 text-base font-medium flex items-center gap-2">
            <svg className="w-5 h-5 text-yellow-200" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            {restaurant.deliveryAddress || restaurant.address || '123 Main St, City, Country'}
          </div>
          <div className="mt-2 text-indigo-100 text-sm italic">
            {restaurant.description || 'A wonderful place to enjoy delicious food and great service.'}
          </div>
          <div className="flex items-center gap-4 mt-6">
            <motion.button
              onClick={toggleFavorite}
              className="p-3 rounded-full bg-white text-red-500 shadow focus:outline-none border border-red-100 hover:bg-red-100 transition relative group"
              whileHover={{ scale: 1.15, rotate: -10 }}
              whileTap={{ scale: 0.95 }}
              title={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill={isFavorite ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="absolute left-1/2 -bottom-8 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-indigo-700 text-white text-xs rounded px-2 py-1 pointer-events-none transition-all duration-200 shadow-lg">
                {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
              </span>
            </motion.button>
          </div>
        </div>
        {/* Right: Image */}
        <div className="flex-1 min-h-[350px] relative">
          <img
            src={restaurant.image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80"}
            alt={restaurant.name}
            className="w-full h-full object-cover rounded-t-3xl md:rounded-none md:rounded-r-3xl shadow-md"
            style={{ minHeight: '350px', maxHeight: '450px' }}
          />
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="border-b border-gray-200 mb-8"></div>
        {/* Category Tabs */}
        <div className="flex space-x-4 mb-8">
          {getMenuCategories().map((category) => (
            <button
              key={category}
              className={`text-xl ${category === activeCategory ? 'text-indigo-500 font-bold underline' : 'text-gray-700'}`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
        {/* Menu Items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {getMenuItemsByCategory(activeCategory).map((item) => (
            <div key={item._id} className="bg-white shadow-lg rounded-lg overflow-hidden transform transition-transform duration-200 hover:-translate-y-2 hover:shadow-2xl relative">
              <img src={item.image || "https://via.placeholder.com/150"} alt={item.name} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h3 className="font-bold text-xl mb-1">{item.name}</h3>
                <p className="text-gray-500 mb-2">{item.description}</p>
                {/* Example badge for popular/new */}
                {item.isPopular && (
                  <span className="absolute top-3 left-3 bg-yellow-400 text-indigo-900 text-xs font-bold px-2 py-1 rounded-full shadow">Popular</span>
                )}
                {item.isNew && (
                  <span className="absolute top-3 right-3 bg-green-400 text-white text-xs font-bold px-2 py-1 rounded-full shadow">New</span>
                )}
                <div className="flex justify-between items-center mt-4">
                  <span className="font-semibold text-lg text-indigo-700">Rs. {Number(item.price).toLocaleString('en-LK', { minimumFractionDigits: 2 })} LKR</span>
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 shadow"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetail;
