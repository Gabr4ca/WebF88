import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import {connectDB} from "./config/db.js";
import foodRoute from "./routes/foodRoute.js";

dotenv.config();

const app = express();
const port = process.env.FOOD_SERVICE_PORT || 4002;

// Enhanced CORS configuration
const corsOptions = {
  origin: [
    "https://uma.gabrys.io.vn",
    process.env.NODE_ENV === "production" ? "https://admin.gabrys.io.vn" : "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:4000",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "token"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Serve images with proper CORS headers
app.use(
  "/images",
  (req, res, next) => {
    // Set CORS headers for images
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.header("Cache-Control", "public, max-age=31536000"); // 1 year cache
    next();
  },
  express.static("uploads")
);

// Database connection
connectDB();

// Health check
app.get("/health", (req, res) => {
  res.json({
    service: "food-service",
    status: "healthy",
    timestamp: new Date().toISOString(),
    port: port,
  });
});

// API endpoints
app.use("/api/food", foodRoute);

// Error handling
app.use((err, req, res, next) => {
  console.error("Food Service Error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    service: "food-service",
  });
});

app.listen(port, () => {
  console.log(`🍕 Food Service running on http://localhost:${port}`);
  console.log(`Health check: http://localhost:${port}/health`);
  console.log(`Food list: http://localhost:${port}/api/food/list`);
  console.log(`Images: http://localhost:${port}/images/`);
});
