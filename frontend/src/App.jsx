import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/layout/Navbar';

// Pages - Customer
import HomePage from './pages/HomePage';
import RestaurantsPage from './pages/RestaurantsPage';
import RestaurantDetail from './pages/RestaurantDetail';
import CartPage from './pages/CartPage';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import OrdersPage from './pages/OrdersPage';
import OrderDetail from './pages/OrderDetail';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import TrackOrderPage from './pages/TrackOrderPage';
import CreateRestaurant from './pages/CreateRestaurant';
import FavoriteRestaurants from './pages/FavoriteRestaurants';
import About from './pages/About';
import Contact from './pages/Contact';

// Pages - Admin
import AdminDashboard from './pages/admin/Dashboard';
import AdminOrders from './pages/admin/Orders';
import AdminUsers from './pages/admin/Users';
import AdminRestaurants from './pages/admin/Restaurants';

// Pages - Restaurant Admin
import RestaurantDashboard from './pages/restaurant/Dashboard';
import ManageMenu from './pages/restaurant/ManageMenu';
import ManageOrders from './pages/restaurant/ManageOrders';

// Pages - Delivery Person
import DeliveryDashboard from './pages/delivery/Dashboard';
import DeliveryEarnings from './pages/delivery/Earnings';

// Guards
import ProtectedRoute from './components/guards/ProtectedRoute';
import RoleRoute from './components/guards/RoleRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/restaurants" element={<RestaurantsPage />} />
                <Route path="/restaurants/:id" element={<RestaurantDetail />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                
                {/* Protected routes - Customer */}
                <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
                <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
                <Route path="/orders/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
                <Route path="/order-confirmation/:id" element={<ProtectedRoute><OrderConfirmation /></ProtectedRoute>} />
                <Route path="/track/:orderId" element={<ProtectedRoute><TrackOrderPage /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                <Route path="/favorites" element={<ProtectedRoute><FavoriteRestaurants /></ProtectedRoute>} />
                
                {/* Admin routes */}
                <Route path="/admin/dashboard" element={<RoleRoute role="admin"><AdminDashboard /></RoleRoute>} />
                <Route path="/admin/orders" element={<RoleRoute role="admin"><AdminOrders /></RoleRoute>} />
                <Route path="/admin/users" element={<RoleRoute role="admin"><AdminUsers /></RoleRoute>} />
                <Route path="/admin/restaurants" element={<RoleRoute role="admin"><AdminRestaurants /></RoleRoute>} />
                
                {/* Restaurant Admin routes */}
                <Route path="/restaurant/dashboard" element={<RoleRoute role="restaurant_admin"><RestaurantDashboard /></RoleRoute>} />
                <Route path="/restaurant/menu" element={<RoleRoute role="restaurant_admin"><ManageMenu /></RoleRoute>} />
                <Route path="/restaurant/orders" element={<RoleRoute role="restaurant_admin"><ManageOrders /></RoleRoute>} />
                
                {/* Delivery Person routes */}
                <Route path="/deliveries" element={<RoleRoute role="delivery_person"><DeliveryDashboard /></RoleRoute>} />
                <Route path="/deliveries/earnings" element={<RoleRoute role="delivery_person"><DeliveryEarnings /></RoleRoute>} />
                
                {/* Restaurant Creation - Available for restaurant_admin and admin */}
                <Route path="/create-restaurant" element={<ProtectedRoute><CreateRestaurant /></ProtectedRoute>} />
              </Routes>
            </main>
            <footer className="bg-gray-800 text-white text-center py-4">
              <p>© 2025 FoodOrdering App. All rights reserved.</p>
            </footer>
          </div>
          <ToastContainer position="top-right" autoClose={3000} />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
