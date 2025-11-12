#!/bin/bash

echo "Copying all required files to microservices..."

# Base directories
BASE_DIR="/home/gabdeavour/Desktop/WebF88/backend"
SERVICES_DIR="$BASE_DIR/services"

# Copy common files to all services
for service in user-service food-service cart-service order-service; do
    echo "Setting up $service..."

    # Create directories if they don't exist
    mkdir -p "$SERVICES_DIR/$service/config"
    mkdir -p "$SERVICES_DIR/$service/models"
    mkdir -p "$SERVICES_DIR/$service/middleware"
    mkdir -p "$SERVICES_DIR/$service/controllers"
    mkdir -p "$SERVICES_DIR/$service/routes"

    # Copy common files
    cp "$BASE_DIR/config/db.js" "$SERVICES_DIR/$service/config/" 2>/dev/null || echo "db.js not found"
    cp "$BASE_DIR/middleware/auth.js" "$SERVICES_DIR/$service/middleware/" 2>/dev/null || echo "auth.js not found"

    # Copy all models to each service (they might need them for relationships)
    cp "$BASE_DIR/models/userModel.js" "$SERVICES_DIR/$service/models/" 2>/dev/null || echo "userModel.js not found"
    cp "$BASE_DIR/models/foodModel.js" "$SERVICES_DIR/$service/models/" 2>/dev/null || echo "foodModel.js not found"
    cp "$BASE_DIR/models/orderModel.js" "$SERVICES_DIR/$service/models/" 2>/dev/null || echo "orderModel.js not found"
done

# Copy specific controllers and routes
echo "Copying specific files..."

# User service
cp "$BASE_DIR/controllers/userController.js" "$SERVICES_DIR/user-service/controllers/" 2>/dev/null
cp "$BASE_DIR/routes/userRoute.js" "$SERVICES_DIR/user-service/routes/" 2>/dev/null

# Food service
cp "$BASE_DIR/controllers/foodController.js" "$SERVICES_DIR/food-service/controllers/" 2>/dev/null
cp "$BASE_DIR/routes/foodRoute.js" "$SERVICES_DIR/food-service/routes/" 2>/dev/null
mkdir -p "$SERVICES_DIR/food-service/uploads"

# Cart service
cp "$BASE_DIR/controllers/cartController.js" "$SERVICES_DIR/cart-service/controllers/" 2>/dev/null
cp "$BASE_DIR/routes/cartRoute.js" "$SERVICES_DIR/cart-service/routes/" 2>/dev/null

# Order service
cp "$BASE_DIR/controllers/orderController.js" "$SERVICES_DIR/order-service/controllers/" 2>/dev/null
cp "$BASE_DIR/routes/orderRoute.js" "$SERVICES_DIR/order-service/routes/" 2>/dev/null

echo "All files copied successfully!"
