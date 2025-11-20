import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import axios from "axios";

const paymentServiceUrl = process.env.PAYMENT_SERVICE_URL || "http://localhost:4005";

// placing user order for frontend
const placeOrder = async (req, res) => {
  const frontend_url = "http://localhost:5173";
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
  const {orderId, success} = req.body;
  try {
    if (success == "true") {
      await orderModel.findByIdAndUpdate(orderId, {payment: true});
      res.json({success: true, message: "Paid"});
    } else {
      await orderModel.findByIdAndDelete(orderId);
      res.json({success: false, message: "Not Paid"});
    }
  } catch (error) {
    console.log(error);
    res.json({success: false, message: "Error"});
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
