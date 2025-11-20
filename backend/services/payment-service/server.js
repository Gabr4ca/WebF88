import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import paymentRoute from "./routes/paymentRoute.js";

dotenv.config();

const app = express();
const port = process.env.PAYMENT_SERVICE_PORT || 4005;

// Middleware
app.use(express.json());
app.use(cors());

// Health check
app.get("/health", (req, res) => {
  res.json({
    service: "payment-service",
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

// API endpoints
app.use("/api/payment", paymentRoute);

app.listen(port, () => {
  console.log(`💳 Payment Service running on http://localhost:${port}`);
});
