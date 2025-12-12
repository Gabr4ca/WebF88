import React, {useContext, useEffect} from "react";
import "./Verify.css";
import {useNavigate, useSearchParams} from "react-router-dom";
import {StoreContext} from "../../context/StoreContext";
import axios from "axios";

const Verify = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const success = searchParams.get("success");
  const orderId = searchParams.get("orderId");
  const sessionId = searchParams.get("session_id");
  const {url} = useContext(StoreContext);
  const navigate = useNavigate();

  const verifyPayment = async () => {
    // Routes through API Gateway to order-service
    // Order service will verify with payment service, which confirms with Stripe
    const response = await axios.post(url + "/api/order/verify", {success, orderId, sessionId});
    if (response.data.success) {
      navigate("/myorders");
    } else {
      navigate("/");
    }
  };

  useEffect(() => {
    verifyPayment();
  }, []);

  return (
    <div className="verify">
      <div className="spinner"></div>
    </div>
  );
};

export default Verify;
