#!/bin/bash

echo "Starting all microservices..."

# Start each service in background
cd ./api-gateway && npm start &
cd ./services/user-service && npm start &
cd ./services/food-service && npm start &
cd ./services/cart-service && npm start &
cd ./services/order-service && npm start &
cd ./services/payment-service && npm start &

echo "All services started!"
echo "API Gateway: http://localhost:4000"
echo "User Service: http://localhost:4001"
echo "Food Service: http://localhost:4002"
echo "Cart Service: http://localhost:4003"
echo "Order Service: http://localhost:4004"
echo "Payment Service: http://localhost:4005"

wait
