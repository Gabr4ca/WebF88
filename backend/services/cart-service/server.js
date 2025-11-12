import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import {connectDB} from "./config/db.js";
import cartRoute from "./routes/cartRoute.js";

dotenv.config();

const app = express();
const port = process.env.CART_SERVICE_PORT || 4003;

// Middleware
app.use(express.json());
app.use(cors());

// Database connection
connectDB();

// Health check
app.get("/health", (req, res) => {
  res.json({
    service: "cart-service",
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

// API endpoints
app.use("/api/cart", cartRoute);

app.listen(port, () => {
  console.log(`🛒 Cart Service running on http://localhost:${port}`);
});
