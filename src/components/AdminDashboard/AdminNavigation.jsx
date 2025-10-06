import React from "react";

const AdminNavigation = ({activeTab, onTabChange}) => {
  const tabs = [
    {id: "dashboard", label: "📊 Dashboard", description: "Overview and statistics"},
    {id: "food", label: "🍕 Food Items", description: "Manage menu items"},
    {id: "orders", label: "📦 Orders", description: "Track and update orders"},
    {id: "users", label: "👥 Users", description: "User management"},
  ];

  return (
    <div className="admin-navigation">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`nav-btn ${activeTab === tab.id ? "active" : ""}`}
          onClick={() => onTabChange(tab.id)}
          title={tab.description}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default AdminNavigation;
