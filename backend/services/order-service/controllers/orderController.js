import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import axios from "axios";

const paymentServiceUrl = process.env.PAYMENT_SERVICE_URL || "http://localhost:4005";

// placing user order for frontend
const placeOrder = async (req, res) => {
  // Use FRONTEND_URL from env, fallback to production URL
  const frontend_url = process.env.FRONTEND_URL || "https://uma.gabrys.io.vn";
  try {
    const newOrder = new orderModel({
      userId: req.body.userId,
      items: req.body.items,
      amount: req.body.amount,
      address: req.body.address,
    });
    await newOrder.save();
    await userModel.findByIdAndUpdate(req.body.userId, {cartData: {}});

    // Call payment service to create checkout session
    const paymentResponse = await axios.post(`${paymentServiceUrl}/api/payment/create-checkout-session`, {
      items: req.body.items,
      amount: req.body.amount,
      orderId: newOrder._id,
      frontendUrl: frontend_url,
    });

    if (paymentResponse.data.success) {
      res.json({success: true, session_url: paymentResponse.data.session_url});
    } else {
      // If payment session creation fails, delete the order
      await orderModel.findByIdAndDelete(newOrder._id);
      res.json({success: false, message: "Payment session creation failed"});
    }
  } catch (error) {
    console.log(error);
    res.json({success: false, message: "Error", error: error.message});
  }
};

const verifyOrder = async (req, res) => {
  const {orderId, success, sessionId} = req.body;
  try {
    if (success == "true" && sessionId) {
      // Verify payment with the payment service (calls Stripe API)
      const paymentVerification = await axios.post(`${paymentServiceUrl}/api/payment/verify`, {
        sessionId: sessionId,
      });

      // Only mark as paid if payment service confirms the payment with Stripe
      if (paymentVerification.data.success && paymentVerification.data.paymentStatus === "paid") {
        await orderModel.findByIdAndUpdate(orderId, {payment: true});
        res.json({success: true, message: "Paid"});
      } else {
        // Payment not confirmed by Stripe - delete the order
        await orderModel.findByIdAndDelete(orderId);
        res.json({success: false, message: "Payment verification failed"});
      }
    } else {
      await orderModel.findByIdAndDelete(orderId);
      res.json({success: false, message: "Not Paid"});
    }
  } catch (error) {
    console.log(error);
    // If verification fails, delete the order to prevent fraud
    await orderModel.findByIdAndDelete(orderId);
    res.json({success: false, message: "Error verifying payment"});
  }
};

// user orders for frontend
const userOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({userId: req.body.userId});
    res.json({success: true, data: orders});
  } catch (error) {
    console.log(error);
    res.json({success: false, message: "Error"});
  }
};

// Listing orders for admin pannel
const listOrders = async (req, res) => {
  try {
    let userData = await userModel.findById(req.body.userId);
    if (userData && userData.role === "admin") {
      const orders = await orderModel.find({});
      res.json({success: true, data: orders});
    } else {
      res.json({success: false, message: "You are not admin"});
    }
  } catch (error) {
    console.log(error);
    res.json({success: false, message: "Error"});
  }
};

// api for updating status
const updateStatus = async (req, res) => {
  try {
    let userData = await userModel.findById(req.body.userId);
    if (userData && userData.role === "admin") {
      await orderModel.findByIdAndUpdate(req.body.orderId, {
        status: req.body.status,
      });
      res.json({success: true, message: "Status Updated Successfully"});
    } else {
      res.json({success: false, message: "You are not an admin"});
    }
  } catch (error) {
    console.log(error);
    res.json({success: false, message: "Error"});
  }
};

export {placeOrder, verifyOrder, userOrders, listOrders, updateStatus};
