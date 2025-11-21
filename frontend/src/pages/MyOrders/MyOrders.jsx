import React, {useContext, useEffect, useState} from "react";
import "./MyOrders.css";
import {StoreContext} from "../../context/StoreContext";
import axios from "axios";
import {assets} from "../../assets/frontend_assets/assets";
import {useSearchParams} from "react-router-dom";

const MyOrders = () => {
  const {url, token} = useContext(StoreContext);
  const [data, setData] = useState([]);
  const [searchParams] = useSearchParams();

  const fetchOrders = async () => {
    // Routes through API Gateway to order-service
    const response = await axios.post(url + "/api/order/userorders", {}, {headers: {token}});
    setData(response.data.data);
  };

  const verifyPayment = async () => {
    const orderId = searchParams.get("orderId");
    const success = searchParams.get("success");

    if (orderId && success) {
      await axios.post(url + "/api/order/verify", {orderId, success});
    }
  };

  useEffect(() => {
    verifyPayment();
    if (token) {
      fetchOrders();
    }
  }, [token]);
  return (
    <div className="my-orders">
      <h2>Orders</h2>
      <div className="container">
        {data.map((order, index) => {
          return (
            <div key={index} className="my-orders-order">
              <img src={assets.parcel_icon} alt="" />
              <p>
                {order.items.map((item, index) => {
                  if (index === order.items.length - 1) {
                    return item.name + " X " + item.quantity;
                  } else {
                    return item.name + " X " + item.quantity + ",";
                  }
                })}
              </p>
              <p>${order.amount}.00</p>
              <p>items: {order.items.length}</p>
              <p>
                <span>&#x25cf;</span>
                <b> {order.status}</b>
              </p>
              <button onClick={fetchOrders}>Track Order</button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyOrders;
