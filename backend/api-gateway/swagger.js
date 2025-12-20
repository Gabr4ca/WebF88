// Swagger/OpenAPI specification for Food Delivery API
export const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "Food Delivery API",
    version: "1.0.0",
    description: "API documentation for Food Delivery microservices platform",
    contact: {
      name: "API Support",
    },
  },
  servers: [
    {
      url: "https://uma.gabrys.io.vn",
      description: "Production server",
    },
    {
      url: "http://localhost:4000",
      description: "Development server",
    },
  ],
  components: {
    securitySchemes: {
      tokenAuth: {
        type: "apiKey",
        in: "header",
        name: "token",
        description: "JWT token for authentication",
      },
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          _id: {type: "string"},
          name: {type: "string"},
          email: {type: "string"},
          role: {type: "string", enum: ["user", "admin"]},
          status: {type: "string", enum: ["active", "deactivated"]},
        },
      },
      Food: {
        type: "object",
        properties: {
          _id: {type: "string"},
          name: {type: "string"},
          description: {type: "string"},
          price: {type: "number"},
          category: {type: "string"},
          image: {type: "string"},
          isDeleted: {type: "boolean"},
        },
      },
      Order: {
        type: "object",
        properties: {
          _id: {type: "string"},
          userId: {type: "string"},
          items: {type: "array", items: {type: "object"}},
          amount: {type: "number"},
          address: {type: "object"},
          status: {type: "string"},
          payment: {type: "boolean"},
          date: {type: "string", format: "date-time"},
        },
      },
      SuccessResponse: {
        type: "object",
        properties: {
          success: {type: "boolean", example: true},
          message: {type: "string"},
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          success: {type: "boolean", example: false},
          message: {type: "string"},
        },
      },
    },
  },
  tags: [
    {name: "User", description: "User authentication and management"},
    {name: "Food", description: "Food items management"},
    {name: "Cart", description: "Shopping cart operations"},
    {name: "Order", description: "Order management"},
    {name: "Payment", description: "Payment processing"},
  ],
  paths: {
    // ==================== USER ENDPOINTS ====================
    "/api/user/register": {
      post: {
        tags: ["User"],
        summary: "Register a new user",
        description: "Create a new user account with email and password",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password"],
                properties: {
                  name: {type: "string", example: "John Doe"},
                  email: {type: "string", format: "email", example: "john@example.com"},
                  password: {type: "string", minLength: 8, example: "password123"},
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "User registered successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {type: "boolean"},
                    token: {type: "string"},
                    role: {type: "string"},
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/user/login": {
      post: {
        tags: ["User"],
        summary: "Login user",
        description: "Authenticate user and receive JWT token",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: {type: "string", format: "email", example: "john@example.com"},
                  password: {type: "string", example: "password123"},
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Login successful",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {type: "boolean"},
                    token: {type: "string"},
                    role: {type: "string"},
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/user/list": {
      get: {
        tags: ["User"],
        summary: "Get all users (Admin only)",
        description: "Retrieve list of all registered users. Requires admin privileges.",
        security: [{tokenAuth: []}],
        responses: {
          200: {
            description: "List of users",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {type: "boolean"},
                    data: {
                      type: "array",
                      items: {$ref: "#/components/schemas/User"},
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/user/update-role": {
      post: {
        tags: ["User"],
        summary: "Update user role (Admin only)",
        description: "Change a user's role between 'user' and 'admin'",
        security: [{tokenAuth: []}],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["targetUserId", "role"],
                properties: {
                  targetUserId: {type: "string", description: "ID of user to update"},
                  role: {type: "string", enum: ["user", "admin"]},
                },
              },
            },
          },
        },
        responses: {
          200: {description: "Role updated successfully"},
        },
      },
    },
    "/api/user/update-status": {
      post: {
        tags: ["User"],
        summary: "Update user status (Admin only)",
        description: "Activate or deactivate a user account",
        security: [{tokenAuth: []}],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["targetUserId", "status"],
                properties: {
                  targetUserId: {type: "string", description: "ID of user to update"},
                  status: {type: "string", enum: ["active", "deactivated"]},
                },
              },
            },
          },
        },
        responses: {
          200: {description: "Status updated successfully"},
        },
      },
    },
    "/api/user/delete": {
      post: {
        tags: ["User"],
        summary: "Delete user (Admin only)",
        description: "Permanently delete a user account",
        security: [{tokenAuth: []}],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["targetUserId"],
                properties: {
                  targetUserId: {type: "string", description: "ID of user to delete"},
                },
              },
            },
          },
        },
        responses: {
          200: {description: "User deleted successfully"},
        },
      },
    },

    // ==================== FOOD ENDPOINTS ====================
    "/api/food/list": {
      get: {
        tags: ["Food"],
        summary: "Get all active food items",
        description: "Retrieve list of all visible food items for customers",
        responses: {
          200: {
            description: "List of food items",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {type: "boolean"},
                    data: {
                      type: "array",
                      items: {$ref: "#/components/schemas/Food"},
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/food/list-all": {
      get: {
        tags: ["Food"],
        summary: "Get all food items including hidden (Admin only)",
        description: "Retrieve complete list of food items including those marked as hidden",
        security: [{tokenAuth: []}],
        responses: {
          200: {
            description: "Complete list of food items",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {type: "boolean"},
                    data: {
                      type: "array",
                      items: {$ref: "#/components/schemas/Food"},
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/food/add": {
      post: {
        tags: ["Food"],
        summary: "Add new food item (Admin only)",
        description: "Create a new food item with image upload",
        security: [{tokenAuth: []}],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["name", "description", "price", "category", "image"],
                properties: {
                  name: {type: "string", example: "Chicken Burger"},
                  description: {type: "string", example: "Delicious grilled chicken burger"},
                  price: {type: "number", example: 12.99},
                  category: {type: "string", example: "Burgers"},
                  image: {type: "string", format: "binary"},
                },
              },
            },
          },
        },
        responses: {
          200: {description: "Food item added successfully"},
        },
      },
    },
    "/api/food/toggle": {
      post: {
        tags: ["Food"],
        summary: "Toggle food visibility (Admin only)",
        description: "Show or hide a food item from customer view",
        security: [{tokenAuth: []}],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["id"],
                properties: {
                  id: {type: "string", description: "Food item ID"},
                },
              },
            },
          },
        },
        responses: {
          200: {description: "Food visibility toggled"},
        },
      },
    },

    // ==================== CART ENDPOINTS ====================
    "/api/cart/add": {
      post: {
        tags: ["Cart"],
        summary: "Add item to cart",
        description: "Add a food item to the user's shopping cart",
        security: [{tokenAuth: []}],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["itemId"],
                properties: {
                  itemId: {type: "string", description: "Food item ID to add"},
                },
              },
            },
          },
        },
        responses: {
          200: {description: "Item added to cart"},
        },
      },
    },
    "/api/cart/remove": {
      post: {
        tags: ["Cart"],
        summary: "Remove item from cart",
        description: "Remove one quantity of a food item from the cart",
        security: [{tokenAuth: []}],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["itemId"],
                properties: {
                  itemId: {type: "string", description: "Food item ID to remove"},
                },
              },
            },
          },
        },
        responses: {
          200: {description: "Item removed from cart"},
        },
      },
    },
    "/api/cart/get": {
      post: {
        tags: ["Cart"],
        summary: "Get cart data",
        description: "Retrieve the current user's cart contents",
        security: [{tokenAuth: []}],
        responses: {
          200: {
            description: "Cart data retrieved",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {type: "boolean"},
                    cartData: {type: "object"},
                  },
                },
              },
            },
          },
        },
      },
    },

    // ==================== ORDER ENDPOINTS ====================
    "/api/order/place": {
      post: {
        tags: ["Order"],
        summary: "Place a new order",
        description: "Create a new order and initiate payment process",
        security: [{tokenAuth: []}],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["items", "amount", "address"],
                properties: {
                  items: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        _id: {type: "string"},
                        name: {type: "string"},
                        price: {type: "number"},
                        quantity: {type: "integer"},
                      },
                    },
                  },
                  amount: {type: "number", example: 45.99},
                  address: {
                    type: "object",
                    properties: {
                      firstName: {type: "string"},
                      lastName: {type: "string"},
                      street: {type: "string"},
                      city: {type: "string"},
                      state: {type: "string"},
                      zipcode: {type: "string"},
                      country: {type: "string"},
                      phone: {type: "string"},
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Order placed, returns Stripe payment URL",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {type: "boolean"},
                    session_url: {type: "string", format: "uri"},
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/order/verify": {
      post: {
        tags: ["Order"],
        summary: "Verify order payment",
        description: "Verify payment status after Stripe checkout",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["orderId", "success"],
                properties: {
                  orderId: {type: "string"},
                  success: {type: "string", enum: ["true", "false"]},
                  sessionId: {type: "string", description: "Stripe session ID"},
                },
              },
            },
          },
        },
        responses: {
          200: {description: "Payment verification result"},
        },
      },
    },
    "/api/order/userorders": {
      post: {
        tags: ["Order"],
        summary: "Get user orders",
        description: "Retrieve all orders for the authenticated user",
        security: [{tokenAuth: []}],
        responses: {
          200: {
            description: "List of user orders",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {type: "boolean"},
                    data: {
                      type: "array",
                      items: {$ref: "#/components/schemas/Order"},
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/order/list": {
      get: {
        tags: ["Order"],
        summary: "Get all orders (Admin only)",
        description: "Retrieve all orders in the system",
        security: [{tokenAuth: []}],
        responses: {
          200: {
            description: "List of all orders",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {type: "boolean"},
                    data: {
                      type: "array",
                      items: {$ref: "#/components/schemas/Order"},
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/order/status": {
      post: {
        tags: ["Order"],
        summary: "Update order status (Admin only)",
        description: "Update the delivery status of an order",
        security: [{tokenAuth: []}],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["orderId", "status"],
                properties: {
                  orderId: {type: "string"},
                  status: {
                    type: "string",
                    enum: ["Food Processing", "Out for delivery", "Delivered"],
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {description: "Order status updated"},
        },
      },
    },

    // ==================== PAYMENT ENDPOINTS ====================
    "/api/payment/create-checkout-session": {
      post: {
        tags: ["Payment"],
        summary: "Create Stripe checkout session",
        description: "Internal endpoint to create a Stripe payment session",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["items", "amount", "orderId", "frontendUrl"],
                properties: {
                  items: {type: "array", items: {type: "object"}},
                  amount: {type: "number"},
                  orderId: {type: "string"},
                  frontendUrl: {type: "string", format: "uri"},
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Checkout session created",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {type: "boolean"},
                    session_url: {type: "string", format: "uri"},
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/payment/verify": {
      post: {
        tags: ["Payment"],
        summary: "Verify Stripe payment",
        description: "Verify payment status with Stripe",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["sessionId"],
                properties: {
                  sessionId: {type: "string", description: "Stripe checkout session ID"},
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Payment verification result",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {type: "boolean"},
                    paymentStatus: {type: "string"},
                    paymentIntent: {type: "string"},
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};
