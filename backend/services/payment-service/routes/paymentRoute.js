import express from "express";
import {createCheckoutSession, verifyPayment} from "../controllers/paymentController.js";

const paymentRoute = express.Router();

paymentRoute.post("/create-checkout-session", createCheckoutSession);
paymentRoute.post("/verify", verifyPayment);

export default paymentRoute;
