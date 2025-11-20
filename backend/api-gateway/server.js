import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.GATEWAY_PORT || 4000;

// CORS configuration
const corsOptions = {
  origin: [
    process.env.NODE_ENV === "production" ? "https://uma.gabrys.io.vn" : "http://localhost:5173",
    process.env.NODE_ENV === "production" ? "https://admin.gabrys.io.vn" : "http://localhost:3000",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "token"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Service URLs
const services = {
  user: "http://localhost:4001",
  food: "http://localhost:4002",
  cart: "http://localhost:4003",
  order: "http://localhost:4004",
  payment: "http://localhost:4005",
};

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "API Gateway is running",
    timestamp: new Date().toISOString(),
    services: services,
  });
});

// Manual proxy function for API requests
const proxyRequest = async (req, res, serviceUrl) => {
  try {
    const targetUrl = serviceUrl + req.originalUrl;

    console.log(`🔄 [API Gateway] ${req.method} ${req.originalUrl}`);
    console.log(`🎯 [API Gateway] → ${targetUrl}`);

    const config = {
      method: req.method.toLowerCase(),
      url: targetUrl,
      headers: {
        ...req.headers,
        host: undefined,
        "content-length": undefined,
      },
      timeout: 30000,
      validateStatus: () => true,
    };

    if (req.method !== "GET" && req.method !== "HEAD" && req.body) {
      config.data = req.body;
    }

    const response = await axios(config);

    console.log(`✅ [API Gateway] Response: ${response.status}`);

    res.status(response.status);

    Object.keys(response.headers).forEach((key) => {
      if (!["transfer-encoding", "connection", "content-encoding"].includes(key.toLowerCase())) {
        res.set(key, response.headers[key]);
      }
    });

    res.send(response.data);
  } catch (error) {
    console.error(`❌ [API Gateway] Proxy error for ${serviceUrl}:`, error.message);

    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(503).json({
        success: false,
        message: "Service temporarily unavailable",
        error: error.message,
        service: serviceUrl,
      });
    }
  }
};

// Special handler for images to ensure proper CORS headers
const proxyImageRequest = async (req, res, serviceUrl) => {
  try {
    const targetUrl = serviceUrl + req.originalUrl;

    console.log(`🖼️  [API Gateway] Image request: ${req.originalUrl}`);
    console.log(`🎯 [API Gateway] → ${targetUrl}`);

    const response = await axios({
      method: "get",
      url: targetUrl,
      responseType: "stream",
      timeout: 30000,
      validateStatus: () => true,
    });

    // Set proper CORS headers for images
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET");
    res.set("Access-Control-Allow-Headers", "Content-Type");

    // Set content type from original response
    if (response.headers["content-type"]) {
      res.set("Content-Type", response.headers["content-type"]);
    }

    // Set cache headers
    res.set("Cache-Control", "public, max-age=31536000"); // 1 year

    res.status(response.status);
    response.data.pipe(res);

    console.log(`✅ [API Gateway] Image served: ${response.status}`);
  } catch (error) {
    console.error(`❌ [API Gateway] Image proxy error:`, error.message);
    res.status(404).send("Image not found");
  }
};

// Route handlers
app.use("/api/user*", (req, res) => {
  proxyRequest(req, res, services.user);
});

app.use("/api/food*", (req, res) => {
  proxyRequest(req, res, services.food);
});

app.use("/api/cart*", (req, res) => {
  proxyRequest(req, res, services.cart);
});

app.use("/api/order*", (req, res) => {
  proxyRequest(req, res, services.order);
});

app.use("/api/payment*", (req, res) => {
  proxyRequest(req, res, services.payment);
});

// Handle images with special CORS handling
app.use("/images*", (req, res) => {
  proxyImageRequest(req, res, services.food);
});

// Debug endpoint
app.get("/debug", (req, res) => {
  res.json({
    gateway: "API Gateway Manual Routing",
    services,
    timestamp: new Date().toISOString(),
    routes: Object.keys(services).map((service) => `/api/${service}/* → ${services[service]}/api/${service}/*`),
  });
});

// 404 handler
app.use("*", (req, res) => {
  console.log(`❌ [API Gateway] 404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    gateway: "API Gateway",
    availableServices: Object.keys(services).map((s) => `/api/${s}`),
  });
});

app.listen(port, () => {
  console.log(`🚀 API Gateway running on http://localhost:${port}`);
  console.log(`📋 Health check: http://localhost:${port}/health`);
  console.log(`🔍 Debug info: http://localhost:${port}/debug`);
  console.log("🔗 Manual routing (preserving full paths):");
  Object.entries(services).forEach(([name, url]) => {
    console.log(`   /api/${name}/* → ${url}/api/${name}/*`);
  });
  console.log(`   /images/* → ${services.food}/images/*`);
});
