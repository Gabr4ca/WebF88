import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import {connectDB} from "./config/db.js";
import userRoute from "./routes/userRoute.js";

dotenv.config();

const app = express();
const port = process.env.USER_SERVICE_PORT || 4001;

// Middleware
app.use(express.json());
app.use(cors());

// Database connection
connectDB();

// Health check
app.get("/health", (req, res) => {
  res.json({
    service: "user-service",
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

// API endpoints
app.use("/api/user", userRoute);

app.listen(port, () => {
  console.log(`👤 User Service running on http://localhost:${port}`);
});
