import {createContext, useEffect, useState} from "react";
import {food_list} from "../assets/assets";
import {
  cartAPI,
  foodItemsAPI,
  categoriesAPI,
  authAPI,
  ordersAPI,
  addressesAPI,
  profileAPI,
} from "../services/apiService";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  // State management
  const [cartItems, setCartItems] = useState({});
  const [foodItems, setFoodItems] = useState(food_list); // Start with static data, then load from API
  const [categories, setCategories] = useState([]);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);

  // Auth functions
  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await authAPI.login(credentials);
      setToken(response.token);
      setUser(response.user);
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      await loadUserData(); // Load cart, orders, addresses
      return {success: true, data: response};
    } catch (error) {
      console.error("Login error:", error);
      return {success: false, error: error.message};
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await authAPI.register(userData);
      setToken(response.token);
      setUser(response.user);
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      return {success: true, data: response};
    } catch (error) {
      console.error("Register error:", error);
      return {success: false, error: error.message};
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setCartItems({});
    setOrders([]);
    setAddresses([]);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  // Cart functions
  const addToCart = async (itemId) => {
    try {
      if (token) {
        // If logged in, use API
        await cartAPI.addItem(itemId, 1);
        await loadCartFromAPI();
      } else {
        // If not logged in, use local state
        if (!cartItems[itemId]) {
          setCartItems((prev) => ({...prev, [itemId]: 1}));
        } else {
          setCartItems((prev) => ({...prev, [itemId]: prev[itemId] + 1}));
        }
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      // Fallback to local state
      if (!cartItems[itemId]) {
        setCartItems((prev) => ({...prev, [itemId]: 1}));
      } else {
        setCartItems((prev) => ({...prev, [itemId]: prev[itemId] + 1}));
      }
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      if (token) {
        // If logged in, use API
        const currentQuantity = cartItems[itemId] || 0;
        const newQuantity = Math.max(0, currentQuantity - 1);
        await cartAPI.updateItem(itemId, newQuantity);
        await loadCartFromAPI();
      } else {
        // If not logged in, use local state
        setCartItems((prev) => ({...prev, [itemId]: Math.max(0, (prev[itemId] || 0) - 1)}));
      }
    } catch (error) {
      console.error("Error removing from cart:", error);
      // Fallback to local state
      setCartItems((prev) => ({...prev, [itemId]: Math.max(0, (prev[itemId] || 0) - 1)}));
    }
  };

  const updateCartItem = async (itemId, quantity) => {
    try {
      if (token) {
        await cartAPI.updateItem(itemId, quantity);
        await loadCartFromAPI();
      } else {
        if (quantity <= 0) {
          const newCart = {...cartItems};
          delete newCart[itemId];
          setCartItems(newCart);
        } else {
          setCartItems((prev) => ({...prev, [itemId]: quantity}));
        }
      }
    } catch (error) {
      console.error("Error updating cart:", error);
    }
  };

  const clearCart = async () => {
    try {
      if (token) {
        await cartAPI.clearCart();
      }
      setCartItems({});
    } catch (error) {
      console.error("Error clearing cart:", error);
      setCartItems({});
    }
  };

  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        let itemInfo = foodItems.find((product) => product._id === item || product.id === item);
        if (itemInfo) {
          totalAmount += itemInfo.price * cartItems[item];
        }
      }
    }
    return totalAmount;
  };

  // Data loading functions
  const loadFoodItems = async (categoryId = null) => {
    try {
      const items = await foodItemsAPI.getAll(categoryId);
      setFoodItems([...food_list, ...items]); // Combine static and API data
    } catch (error) {
      console.error("Error loading food items:", error);
      // Keep using static data on error
    }
  };

  const loadCategories = async () => {
    try {
      const cats = await categoriesAPI.getAll();
      setCategories(cats);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const loadCartFromAPI = async () => {
    try {
      if (!token) return;
      const cartData = await cartAPI.getCart();
      const cartObj = {};
      cartData.forEach((item) => {
        cartObj[item.food_item_id] = item.quantity;
      });
      setCartItems(cartObj);
    } catch (error) {
      console.error("Error loading cart:", error);
    }
  };

  const loadOrders = async () => {
    try {
      if (!token) return;
      const orderData = await ordersAPI.getAll();
      setOrders(orderData);
    } catch (error) {
      console.error("Error loading orders:", error);
    }
  };

  const loadAddresses = async () => {
    try {
      if (!token) return;
      const addressData = await addressesAPI.getAll();
      setAddresses(addressData);
    } catch (error) {
      console.error("Error loading addresses:", error);
    }
  };

  const loadUserData = async () => {
    if (!token) return;
    await Promise.all([loadCartFromAPI(), loadOrders(), loadAddresses()]);
  };

  // Order functions
  const placeOrder = async (orderData) => {
    try {
      setLoading(true);
      const response = await ordersAPI.create(orderData);
      await loadOrders(); // Refresh orders
      await clearCart(); // Clear cart after successful order
      return {success: true, data: response};
    } catch (error) {
      console.error("Error placing order:", error);
      return {success: false, error: error.message};
    } finally {
      setLoading(false);
    }
  };

  // Address functions
  const addAddress = async (addressData) => {
    try {
      const response = await addressesAPI.add(addressData);
      await loadAddresses(); // Refresh addresses
      return {success: true, data: response};
    } catch (error) {
      console.error("Error adding address:", error);
      return {success: false, error: error.message};
    }
  };

  // Initialize data on mount
  useEffect(() => {
    // Load public data
    loadCategories();
    loadFoodItems();

    // Check if user is logged in
    const storedUser = localStorage.getItem("user");
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      loadUserData();
    }
  }, [token]);

  const contextValue = {
    // Static data (backward compatibility)
    food_list,

    // Dynamic data
    foodItems,
    categories,
    cartItems,
    user,
    token,
    loading,
    orders,
    addresses,

    // State setters
    setCartItems,
    setUser,
    setToken,

    // Auth functions
    login,
    register,
    logout,

    // Cart functions
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart,
    getTotalCartAmount,

    // Data loading functions
    loadFoodItems,
    loadCategories,
    loadCartFromAPI,
    loadOrders,
    loadAddresses,

    // Order functions
    placeOrder,

    // Address functions
    addAddress,
  };

  return <StoreContext.Provider value={contextValue}>{props.children}</StoreContext.Provider>;
};

export default StoreContextProvider;
