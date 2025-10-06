import React, {useState, useEffect, useContext} from "react";
import {StoreContext} from "../../context/StoreContext";
import {adminAPI} from "../../services/apiService";
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
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalFoodItems: 0,
  });

  // Food Items Management
  const [foodItems, setFoodItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingFood, setEditingFood] = useState(null);
  const [newFoodItem, setNewFoodItem] = useState({
    name: "",
    category_id: "",
    description: "",
    price: "",
    image_url: "",
    is_available: true,
  });

  // Orders Management
  const [orders, setOrders] = useState([]);
  const [orderFilter, setOrderFilter] = useState("all");

  // Users Management
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (token) {
      loadDashboardData();
    }
  }, [token, activeTab]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all(
        [
          loadStats(),
          activeTab === "food" && loadFoodItems(),
          activeTab === "orders" && loadOrders(),
          activeTab === "users" && loadUsers(),
          (activeTab === "food" || activeTab === "dashboard") && loadCategories(),
        ].filter(Boolean)
      );
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

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
      const {categoriesAPI} = await import("../../services/apiService");
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

  const handleAddFoodItem = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.createFoodItem(newFoodItem);
      setNewFoodItem({
        name: "",
        category_id: "",
        description: "",
        price: "",
        image_url: "",
        is_available: true,
      });
      loadFoodItems();
      alert("Food item added successfully!");
    } catch (error) {
      console.error("Error adding food item:", error);
      alert("Error adding food item: " + error.message);
    }
  };

  const handleUpdateFoodItem = async (id, updates) => {
    try {
      await adminAPI.updateFoodItem(id, updates);
      loadFoodItems();
      setEditingFood(null);
      alert("Food item updated successfully!");
    } catch (error) {
      console.error("Error updating food item:", error);
      alert("Error updating food item: " + error.message);
    }
  };

  const handleDeleteFoodItem = async (id) => {
    if (window.confirm("Are you sure you want to delete this food item?")) {
      try {
        await adminAPI.deleteFoodItem(id);
        loadFoodItems();
        alert("Food item deleted successfully!");
      } catch (error) {
        console.error("Error deleting food item:", error);
        alert("Error deleting food item: " + error.message);
      }
    }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      await adminAPI.updateOrderStatus(orderId, status);
      loadOrders();
      alert("Order status updated successfully!");
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Error updating order status: " + error.message);
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (orderFilter === "all") return true;
    return order.order_status === orderFilter;
  });

  const formatCurrency = (amount) => `$${parseFloat(amount).toFixed(2)}`;
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString();

  if (!token) {
    return (
      <div className="admin-login-required">
        <h2>Admin Access Required</h2>
        <p>Please log in with admin credentials to access the dashboard.</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <div className="admin-user-info">Welcome, {user?.name || "Admin"}</div>
      </div>

      <div className="admin-navigation">
        <button
          className={`nav-btn ${activeTab === "dashboard" ? "active" : ""}`}
          onClick={() => setActiveTab("dashboard")}
        >
          📊 Dashboard
        </button>
        <button className={`nav-btn ${activeTab === "food" ? "active" : ""}`} onClick={() => setActiveTab("food")}>
          🍕 Food Items
        </button>
        <button className={`nav-btn ${activeTab === "orders" ? "active" : ""}`} onClick={() => setActiveTab("orders")}>
          📦 Orders
        </button>
        <button className={`nav-btn ${activeTab === "users" ? "active" : ""}`} onClick={() => setActiveTab("users")}>
          👥 Users
        </button>
      </div>

      {loading && <Loading size="large" message="Loading dashboard data..." />}

      <div className="admin-content">
        {activeTab === "dashboard" && (
          <div className="dashboard-overview">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-info">
                  <h3>{stats.totalUsers}</h3>
                  <p>Total Users</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📦</div>
                <div className="stat-info">
                  <h3>{stats.totalOrders}</h3>
                  <p>Total Orders</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">💰</div>
                <div className="stat-info">
                  <h3>{formatCurrency(stats.totalRevenue)}</h3>
                  <p>Total Revenue</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🍕</div>
                <div className="stat-info">
                  <h3>{stats.totalFoodItems}</h3>
                  <p>Food Items</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "food" && (
          <div className="food-management">
            <div className="add-food-form">
              <h2>Add New Food Item</h2>
              <form onSubmit={handleAddFoodItem}>
                <div className="form-grid">
                  <input
                    type="text"
                    placeholder="Food Name"
                    value={newFoodItem.name}
                    onChange={(e) => setNewFoodItem({...newFoodItem, name: e.target.value})}
                    required
                  />
                  <select
                    value={newFoodItem.category_id}
                    onChange={(e) => setNewFoodItem({...newFoodItem, category_id: e.target.value})}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Price"
                    value={newFoodItem.price}
                    onChange={(e) => setNewFoodItem({...newFoodItem, price: e.target.value})}
                    required
                  />
                  <input
                    type="url"
                    placeholder="Image URL"
                    value={newFoodItem.image_url}
                    onChange={(e) => setNewFoodItem({...newFoodItem, image_url: e.target.value})}
                  />
                </div>
                <textarea
                  placeholder="Description"
                  value={newFoodItem.description}
                  onChange={(e) => setNewFoodItem({...newFoodItem, description: e.target.value})}
                  rows="3"
                />
                <div className="checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={newFoodItem.is_available}
                      onChange={(e) => setNewFoodItem({...newFoodItem, is_available: e.target.checked})}
                    />
                    Available for order
                  </label>
                </div>
                <button type="submit">Add Food Item</button>
              </form>
            </div>

            <div className="food-items-list">
              <h2>Manage Food Items</h2>
              <div className="food-grid">
                {foodItems.map((item) => (
                  <div key={item.id} className="food-card">
                    {editingFood === item.id ? (
                      <EditFoodForm
                        item={item}
                        categories={categories}
                        onSave={(updates) => handleUpdateFoodItem(item.id, updates)}
                        onCancel={() => setEditingFood(null)}
                      />
                    ) : (
                      <FoodItemDisplay
                        item={item}
                        onEdit={() => setEditingFood(item.id)}
                        onDelete={() => handleDeleteFoodItem(item.id)}
                        onToggleAvailability={(available) => handleUpdateFoodItem(item.id, {is_available: available})}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="orders-management">
            <div className="orders-header">
              <h2>Order Management</h2>
              <select value={orderFilter} onChange={(e) => setOrderFilter(e.target.value)} className="order-filter">
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="out_for_delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="orders-list">
              {filteredOrders.map((order) => (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <h3>Order #{order.id}</h3>
                    <div className="order-actions">
                      <select
                        value={order.order_status}
                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                        className={`status-select status-${order.order_status}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="out_for_delivery">Out for Delivery</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                  <div className="order-details">
                    <p>
                      <strong>Customer:</strong> {order.customer_name}
                    </p>
                    <p>
                      <strong>Date:</strong> {formatDate(order.created_at)}
                    </p>
                    <p>
                      <strong>Total:</strong> {formatCurrency(order.grand_total)}
                    </p>
                    <p>
                      <strong>Address:</strong> {order.delivery_address}
                    </p>
                    <p>
                      <strong>Payment:</strong> {order.payment_method}
                    </p>
                  </div>
                  {order.items && (
                    <div className="order-items">
                      <h4>Items:</h4>
                      {order.items.map((item, index) => (
                        <div key={index} className="order-item">
                          <span>
                            {item.name} x {item.quantity}
                          </span>
                          <span>{formatCurrency(item.price_at_purchase * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="users-management">
            <h2>User Management</h2>
            <div className="users-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Join Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.phone || "N/A"}</td>
                      <td>
                        <span className={`status-badge status-${user.status}`}>{user.status}</span>
                      </td>
                      <td>{formatDate(user.created_at || new Date())}</td>
                      <td>
                        <button
                          className="btn-small"
                          onClick={() => {
                            /* View user details */
                          }}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper components
const FoodItemDisplay = ({item, onEdit, onDelete, onToggleAvailability}) => (
  <>
    <div className="food-image">
      {item.image_url ? <img src={item.image_url} alt={item.name} /> : <div className="no-image">No Image</div>}
    </div>
    <div className="food-info">
      <h3>{item.name}</h3>
      <p className="category">{item.category_name}</p>
      <p className="description">{item.description}</p>
      <p className="price">${item.price}</p>
      <div className="availability">
        <label>
          <input type="checkbox" checked={item.is_available} onChange={(e) => onToggleAvailability(e.target.checked)} />
          Available
        </label>
      </div>
    </div>
    <div className="food-actions">
      <button onClick={onEdit}>Edit</button>
      <button onClick={onDelete} className="danger">
        Delete
      </button>
    </div>
  </>
);

const EditFoodForm = ({item, categories, onSave, onCancel}) => {
  const [formData, setFormData] = useState({
    name: item.name,
    category_id: item.category_id,
    description: item.description || "",
    price: item.price,
    image_url: item.image_url || "",
    is_available: item.is_available,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="edit-food-form">
      <input
        type="text"
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
        required
      />
      <select
        value={formData.category_id}
        onChange={(e) => setFormData({...formData, category_id: e.target.value})}
        required
      >
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>
      <input
        type="number"
        step="0.01"
        value={formData.price}
        onChange={(e) => setFormData({...formData, price: e.target.value})}
        required
      />
      <input
        type="url"
        value={formData.image_url}
        onChange={(e) => setFormData({...formData, image_url: e.target.value})}
        placeholder="Image URL"
      />
      <textarea
        value={formData.description}
        onChange={(e) => setFormData({...formData, description: e.target.value})}
        rows="2"
      />
      <label>
        <input
          type="checkbox"
          checked={formData.is_available}
          onChange={(e) => setFormData({...formData, is_available: e.target.checked})}
        />
        Available
      </label>
      <div className="form-actions">
        <button type="submit">Save</button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
};

export default AdminDashboard;
