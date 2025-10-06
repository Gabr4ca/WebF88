import React, {useState, useContext, useEffect} from "react";
import {StoreContext} from "../../context/StoreContext";
import {profileAPI} from "../../services/apiService";
import Loading from "../Loading/Loading";
import "./UserProfile.css";

const UserProfile = () => {
  const {user, setUser, token, orders, addresses} = useContext(StoreContext);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    avatar: "",
  });
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        avatar: user.avatar || "",
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await profileAPI.update(formData);
      setUser({...user, ...formData});
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (error) {
      alert("Error updating profile: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "delivered":
        return "status-delivered";
      case "processing":
        return "status-processing";
      case "out_for_delivery":
        return "status-delivery";
      case "pending":
        return "status-pending";
      case "cancelled":
        return "status-cancelled";
      default:
        return "status-default";
    }
  };

  if (!token || !user) {
    return (
      <div className="profile-container">
        <p>Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>My Account</h1>
        <div className="profile-tabs">
          <button
            className={`tab-button ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            Profile
          </button>
          <button
            className={`tab-button ${activeTab === "orders" ? "active" : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            Orders
          </button>
          <button
            className={`tab-button ${activeTab === "addresses" ? "active" : ""}`}
            onClick={() => setActiveTab("addresses")}
          >
            Addresses
          </button>
        </div>
      </div>

      {activeTab === "profile" && (
        <div className="profile-content">
          <div className="profile-card">
            <div className="profile-avatar">
              {user.avatar ? (
                <img src={user.avatar} alt="Profile" />
              ) : (
                <div className="avatar-placeholder">{user.name?.charAt(0)?.toUpperCase() || "U"}</div>
              )}
            </div>

            <div className="profile-info">
              {isEditing ? (
                <div className="edit-form">
                  <div className="form-group">
                    <label>Name:</label>
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} />
                  </div>
                  <div className="form-group">
                    <label>Phone:</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} />
                  </div>
                  <div className="form-group">
                    <label>Avatar URL:</label>
                    <input
                      type="url"
                      name="avatar"
                      value={formData.avatar}
                      onChange={handleInputChange}
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>
                  <div className="form-actions">
                    <button onClick={handleSave} disabled={loading} className="save-button">
                      {loading ? "Saving..." : "Save"}
                    </button>
                    <button onClick={() => setIsEditing(false)} className="cancel-button">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="display-info">
                  <h2>{user.name}</h2>
                  <p>
                    <strong>Email:</strong> {user.email}
                  </p>
                  <p>
                    <strong>Phone:</strong> {user.phone || "Not provided"}
                  </p>
                  <button onClick={() => setIsEditing(true)} className="edit-button">
                    Edit Profile
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "orders" && (
        <div className="orders-content">
          <h2>My Orders</h2>
          {orders.length === 0 ? (
            <p>No orders yet.</p>
          ) : (
            <div className="orders-list">
              {orders.map((order) => (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <span className="order-id">Order #{order.id}</span>
                    <span className={`order-status ${getStatusBadgeClass(order.order_status)}`}>
                      {order.order_status.replace("_", " ").toUpperCase()}
                    </span>
                  </div>
                  <div className="order-details">
                    <p>
                      <strong>Date:</strong> {formatDate(order.created_at)}
                    </p>
                    <p>
                      <strong>Total:</strong> ${order.grand_total}
                    </p>
                    <p>
                      <strong>Address:</strong> {order.address}, {order.city}
                    </p>
                  </div>
                  <div className="order-items">
                    <h4>Items:</h4>
                    {order.items?.map((item, index) => (
                      <div key={index} className="order-item">
                        <span>
                          {item.name || "Item"} x {item.quantity}
                        </span>
                        <span>${(item.price_at_purchase * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "addresses" && (
        <div className="addresses-content">
          <h2>My Addresses</h2>
          {addresses.length === 0 ? (
            <p>No addresses saved.</p>
          ) : (
            <div className="addresses-list">
              {addresses.map((address) => (
                <div key={address.id} className="address-card">
                  <div className="address-header">
                    <h4>{address.address}</h4>
                    {address.is_default && <span className="default-badge">Default</span>}
                  </div>
                  <p>{address.street}</p>
                  {address.apartment && <p>Apt: {address.apartment}</p>}
                  <p>
                    {address.city}, {address.province}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserProfile;
