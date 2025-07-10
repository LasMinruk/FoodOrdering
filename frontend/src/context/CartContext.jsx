import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [restaurant, setRestaurant] = useState(null);

  // Load cart from localStorage on component mount
  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    const storedRestaurant = localStorage.getItem('restaurant');

    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }

    if (storedRestaurant) {
      setRestaurant(JSON.parse(storedRestaurant));
    }
  }, []);

  // Update cart count and total whenever cart items change
  useEffect(() => {
    updateCartCountAndTotal();
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Update restaurant in localStorage when it changes
  useEffect(() => {
    if (restaurant) {
      localStorage.setItem('restaurant', JSON.stringify(restaurant));
    } else {
      localStorage.removeItem('restaurant');
    }
  }, [restaurant]);

  const updateCartCountAndTotal = () => {
    const count = cartItems.reduce((total, item) => total + item.quantity, 0);
    setCartCount(count);

    const price = cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    setCartTotal(price);
  };

  // Function to return the total price of the cart
  const getTotalPrice = () => cartTotal;

  const addToCart = (item, selectedRestaurant) => {
    if (restaurant && selectedRestaurant.id !== restaurant.id) {
      if (
        !window.confirm(
          'Your cart contains items from a different restaurant. Would you like to clear your cart and add this item?'
        )
      ) {
        return;
      }
      clearCart();
    }

    if (!restaurant) {
      setRestaurant(selectedRestaurant);
    }

    const existingItem = cartItems.find(
      (cartItem) => cartItem._id === item._id
    );

    if (existingItem) {
      setCartItems(
        cartItems.map((cartItem) =>
          cartItem._id === item._id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      );
    } else {
      setCartItems([...cartItems, { ...item, quantity: 1 }]);
    }

    toast.success(`${item.name} added to cart`);
  };

  const updateQuantity = (itemId, quantity) => {
    if (quantity < 1) {
      removeFromCart(itemId);
      return;
    }

    setCartItems(
      cartItems.map((item) =>
        item._id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const incrementItem = (itemId) => {
    setCartItems(
      cartItems.map((item) =>
        item._id === itemId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const decrementItem = (itemId) => {
    const item = cartItems.find((item) => item._id === itemId);

    if (item.quantity === 1) {
      removeFromCart(itemId);
    } else {
      setCartItems(
        cartItems.map((item) =>
          item._id === itemId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
      );
    }
  };

  const removeFromCart = (itemId) => {
    const item = cartItems.find((item) => item._id === itemId);

    setCartItems(cartItems.filter((item) => item._id !== itemId));

    toast.info(`${item?.name || 'Item'} removed from cart`);

    if (cartItems.length === 1) {
      setRestaurant(null);
    }
  };

  const clearCart = () => {
    setCartItems([]);
    setRestaurant(null);
    toast.info('Cart cleared');
  };

  const value = {
    cartItems,
    cartCount,
    cartTotal,
    restaurant,
    addToCart,
    updateQuantity,
    incrementItem,
    decrementItem,
    removeFromCart,
    clearCart,
    getTotalPrice, 
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
