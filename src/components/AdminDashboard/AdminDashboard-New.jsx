import React, {useState, useEffect, useContext} from "react";
import {StoreContext} from "../../context/StoreContext";
import {adminAPI, categoriesAPI} from "../../services/apiService";
import Loading from "../Loading/Loading";
import AdminNavigation from "./AdminNavigation";
import DashboardStats from "./DashboardStats";
import FoodManagement from "./FoodManagement";
import OrderManagement from "./OrderManagement";
import UserManagement from "./UserManagement";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const {token, user} = useContext(StoreContext);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(false);

  // State for different sections
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalFoodItems: 0,
  });
  const [foodItems, setFoodItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [orderFilter, setOrderFilter] = useState("all");

  // Utility functions
  const formatCurrency = (amount) => `$${parseFloat(amount || 0).toFixed(2)}`;
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString();

  // Data loading functions
  const loadStats = async () => {
    try {
      const data = await adminAPI.getStats();
      setStats(data);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const loadFoodItems = async () => {
    try {
      const data = await adminAPI.getFoodItems();
      setFoodItems(data);
    } catch (error) {
      console.error("Error loading food items:", error);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await categoriesAPI.getAll();
      setCategories(data);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const loadOrders = async () => {
    try {
      const data = await adminAPI.getOrders();
      setOrders(data);
    } catch (error) {
      console.error("Error loading orders:", error);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await adminAPI.getUsers();
      setUsers(data);
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  // Load data when tab changes or on mount
  useEffect(() => {
    if (!token) return;

    const loadData = async () => {
      setLoading(true);
      try {
        // Always load stats
        await loadStats();

        // Load data based on active tab
        switch (activeTab) {
          case "food":
            await Promise.all([loadFoodItems(), loadCategories()]);
            break;
          case "orders":
            await loadOrders();
            break;
          case "users":
            await loadUsers();
            break;
          case "dashboard":
            await loadCategories();
            break;
          default:
            break;
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [token, activeTab]);

  // Event handlers for food management
  const handleAddFoodItem = async (newFoodItem) => {
    try {
      await adminAPI.createFoodItem(newFoodItem);
      await loadFoodItems();
      await loadStats(); // Refresh stats
      alert("Food item added successfully!");
    } catch (error) {
      console.error("Error adding food item:", error);
      alert("Error adding food item: " + error.message);
      throw error; // Re-throw to let AddFoodForm handle it
    }
  };

  const handleUpdateFoodItem = async (id, updates) => {
    try {
      await adminAPI.updateFoodItem(id, updates);
      await loadFoodItems();
      await loadStats();
      alert("Food item updated successfully!");
    } catch (error) {
      console.error("Error updating food item:", error);
      alert("Error updating food item: " + error.message);
    }
  };

  const handleDeleteFoodItem = async (id) => {
    try {
      await adminAPI.deleteFoodItem(id);
      await loadFoodItems();
      await loadStats();
      alert("Food item deleted successfully!");
    } catch (error) {
      console.error("Error deleting food item:", error);
      alert("Error deleting food item: " + error.message);
    }
  };

  const handleToggleFoodAvailability = async (id, isAvailable) => {
    try {
      const item = foodItems.find((f) => f.id === id);
      if (item) {
        await adminAPI.updateFoodItem(id, {...item, is_available: isAvailable});
        await loadFoodItems();
        await loadStats();
      }
    } catch (error) {
      console.error("Error updating food availability:", error);
      alert("Error updating availability: " + error.message);
    }
  };

  // Event handlers for order management
  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      await adminAPI.updateOrderStatus(orderId, status);
      await loadOrders();
      await loadStats();
      alert("Order status updated successfully!");
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Error updating order status: " + error.message);
    }
  };

  // Check if user has admin access
  if (!token || !user) {
    return (
      <div className="admin-login-required">
        <h2>Admin Access Required</h2>
        <p>Please log in with admin credentials to access the dashboard.</p>
      </div>
    );
  }

  if (!user?.email?.includes("admin")) {
    return (
      <div className="admin-access-denied">
        <h2>Access Denied</h2>
        <p>You do not have permission to access the admin dashboard.</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <div className="admin-user-info">Welcome, {user?.name || "Admin"}</div>
      </div>

      <AdminNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {loading && <Loading size="large" message="Loading dashboard data..." />}

      <div className="admin-content">
        {activeTab === "dashboard" && <DashboardStats stats={stats} formatCurrency={formatCurrency} />}

        {activeTab === "food" && (
          <FoodManagement
            foodItems={foodItems}
            categories={categories}
            onAddFoodItem={handleAddFoodItem}
            onUpdateFoodItem={handleUpdateFoodItem}
            onDeleteFoodItem={handleDeleteFoodItem}
            onToggleAvailability={handleToggleFoodAvailability}
          />
        )}

        {activeTab === "orders" && (
          <OrderManagement
            orders={orders}
            orderFilter={orderFilter}
            onFilterChange={setOrderFilter}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
          />
        )}

        {activeTab === "users" && (
          <UserManagement users={users} formatDate={formatDate} formatCurrency={formatCurrency} />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
