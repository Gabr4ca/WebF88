import React from "react";

const UserManagement = ({users, formatDate, formatCurrency}) => {
  const getUserStats = () => {
    return {
      total: users.length,
      active: users.filter((u) => u.status === "active").length,
      inactive: users.filter((u) => u.status === "inactive").length,
      totalRevenue: users.reduce((sum, u) => sum + parseFloat(u.total_spent || 0), 0),
    };
  };

  const stats = getUserStats();

  return (
    <div className="users-management">
      <div className="users-header">
        <h2>User Management</h2>
        <div className="user-stats">
          <div className="stat-item">
            <span className="stat-number">{stats.total}</span>
            <span className="stat-label">Total Users</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.active}</span>
            <span className="stat-label">Active</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.inactive}</span>
            <span className="stat-label">Inactive</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{formatCurrency(stats.totalRevenue)}</span>
            <span className="stat-label">Total Revenue</span>
          </div>
        </div>
      </div>

      <div className="users-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Orders</th>
              <th>Total Spent</th>
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
                <td>{user.total_orders || 0}</td>
                <td>{formatCurrency(user.total_spent || 0)}</td>
                <td>{formatDate(user.created_at || new Date())}</td>
                <td>
                  <button
                    className="btn-small"
                    onClick={() => {
                      // Future: Open user details modal
                      alert(
                        `User details for ${user.name}\nEmail: ${user.email}\nOrders: ${
                          user.total_orders
                        }\nSpent: ${formatCurrency(user.total_spent || 0)}`
                      );
                    }}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="empty-state">
            <p>No users found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
