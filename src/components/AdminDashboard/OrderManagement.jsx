import React from "react";
import OrderCard from "./OrderCard";

const OrderManagement = ({orders, orderFilter, onFilterChange, onUpdateOrderStatus, formatCurrency, formatDate}) => {
  const filteredOrders = orders.filter((order) => {
    if (orderFilter === "all") return true;
    return order.order_status === orderFilter;
  });

  const getOrderStats = () => {
    return {
      total: orders.length,
      pending: orders.filter((o) => o.order_status === "pending").length,
      processing: orders.filter((o) => o.order_status === "processing").length,
      delivering: orders.filter((o) => o.order_status === "out_for_delivery").length,
      delivered: orders.filter((o) => o.order_status === "delivered").length,
      cancelled: orders.filter((o) => o.order_status === "cancelled").length,
    };
  };

  const stats = getOrderStats();

  return (
    <div className="orders-management">
      <div className="orders-header">
        <div>
          <h2>Order Management</h2>
          <div className="order-stats">
            <span>Total: {stats.total}</span>
            <span>Pending: {stats.pending}</span>
            <span>Processing: {stats.processing}</span>
            <span>Delivering: {stats.delivering}</span>
            <span>Delivered: {stats.delivered}</span>
            <span>Cancelled: {stats.cancelled}</span>
          </div>
        </div>
        <select value={orderFilter} onChange={(e) => onFilterChange(e.target.value)} className="order-filter">
          <option value="all">All Orders ({orders.length})</option>
          <option value="pending">Pending ({stats.pending})</option>
          <option value="processing">Processing ({stats.processing})</option>
          <option value="out_for_delivery">Out for Delivery ({stats.delivering})</option>
          <option value="delivered">Delivered ({stats.delivered})</option>
          <option value="cancelled">Cancelled ({stats.cancelled})</option>
        </select>
      </div>

      <div className="orders-list">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onUpdateStatus={onUpdateOrderStatus}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
            />
          ))
        ) : (
          <div className="empty-state">
            <p>No orders found for the selected filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderManagement;
