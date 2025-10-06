import React from "react";

const OrderCard = ({order, onUpdateStatus, formatCurrency, formatDate}) => {
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

  return (
    <div className="order-card">
      <div className="order-header">
        <h3>Order #{order.id}</h3>
        <div className="order-actions">
          <select
            value={order.order_status}
            onChange={(e) => onUpdateStatus(order.id, e.target.value)}
            className={`status-select ${getStatusBadgeClass(order.order_status)}`}
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
          <strong>Email:</strong> {order.customer_email}
        </p>
        <p>
          <strong>Date:</strong> {formatDate(order.created_at)}
        </p>
        <p>
          <strong>Total:</strong> {formatCurrency(order.grand_total)}
        </p>
        <p>
          <strong>Payment:</strong> {order.payment_method}
        </p>
        <p>
          <strong>Address:</strong> {order.delivery_address}
        </p>
      </div>
      {order.items && order.items.length > 0 && (
        <div className="order-items">
          <h4>Items ({order.items.length}):</h4>
          {order.items.map((item, index) => (
            <div key={index} className="order-item">
              <span>
                {item.name || "Unknown Item"} x {item.quantity}
              </span>
              <span>{formatCurrency(item.price_at_purchase * item.quantity)}</span>
            </div>
          ))}
        </div>
      )}
      {order.notes && (
        <div className="order-notes">
          <h4>Notes:</h4>
          <p>{order.notes}</p>
        </div>
      )}
    </div>
  );
};

export default OrderCard;
