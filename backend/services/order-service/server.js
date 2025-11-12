import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import {connectDB} from "./config/db.js";
import orderRoute from "./routes/orderRoute.js";

dotenv.config();

const app = express();
const port = process.env.ORDER_SERVICE_PORT || 4004;

// Middleware
app.use(express.json());
app.use(cors());

// Database connection
connectDB();

// Health check
app.get("/health", (req, res) => {
  res.json({
    service: "order-service",
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

// API endpoints
app.use("/api/order", orderRoute);

app.listen(port, () => {
  console.log(`📦 Order Service running on http://localhost:${port}`);
});
