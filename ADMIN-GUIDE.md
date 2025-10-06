# Admin Dashboard - Food Delivery Application

## Overview

A comprehensive admin interface for managing all aspects of the food delivery backend system.

## Admin Access

### Admin Credentials

- **Email:** `admin@fooddelivery.com`
- **Password:** `admin123`

### Accessing Admin Panel

1. Log in with admin credentials
2. Navigate to `/admin` or use the "Admin Panel" option in the user dropdown menu
3. Only users with 'admin' in their email address can access the admin panel

## Features

### 📊 **Dashboard Overview**

- **Statistics Cards:**
  - Total active users
  - Total orders placed
  - Total revenue from delivered orders
  - Total available food items
- Real-time data updates
- Color-coded metrics for quick insights

### 🍕 **Food Items Management**

- **Add New Food Items:**

  - Name, category, price, description
  - Image URL support
  - Availability toggle
  - Category selection from existing categories

- **Manage Existing Items:**
  - Edit item details inline
  - Toggle availability on/off
  - Delete items with confirmation
  - View by category
  - Real-time updates

### 📦 **Order Management**

- **Order Tracking:**

  - View all orders with customer details
  - Filter by status (pending, processing, out for delivery, delivered, cancelled)
  - Update order status in real-time
  - View order items and quantities
  - Customer and delivery information

- **Order Status Management:**
  - Change order status with dropdown
  - Automatic customer notifications (future feature)
  - Order history tracking

### 👥 **User Management**

- **User Overview:**
  - List all registered users
  - View user statistics (total orders, total spent)
  - User status management
  - Join date and contact information
  - Search and filter capabilities (future enhancement)

## API Endpoints

### Authentication Required

All admin endpoints require:

```
Authorization: Bearer <jwt_token>
```

### Admin Statistics

```http
GET /api/admin/stats
```

Returns dashboard statistics

### Food Items Management

```http
GET /api/admin/food-items          # Get all food items
POST /api/admin/food-items         # Create new food item
PUT /api/admin/food-items/:id      # Update food item
DELETE /api/admin/food-items/:id   # Delete food item
```

### Order Management

```http
GET /api/admin/orders                    # Get all orders
PUT /api/admin/orders/:id/status         # Update order status
```

### User Management

```http
GET /api/admin/users                     # Get all users
```

### Category Management

```http
POST /api/admin/categories               # Create new category
```

## Security Features

### Role-Based Access

- Admin detection based on email containing 'admin'
- Protected routes with authentication middleware
- Admin-only endpoints with role verification

### Data Validation

- Input validation for all forms
- Required field checking
- Price and quantity validation
- Email format validation

## UI/UX Features

### Responsive Design

- Mobile-friendly interface
- Tablet and desktop optimized
- Touch-friendly controls

### Real-time Updates

- Automatic data refresh
- Status change confirmations
- Error handling with user feedback

### Navigation

- Tabbed interface for different sections
- Breadcrumb navigation
- Quick actions and shortcuts

## Usage Instructions

### Adding Food Items

1. Go to "Food Items" tab
2. Fill out the "Add New Food Item" form:
   - **Name:** Item name (required)
   - **Category:** Select from dropdown (required)
   - **Price:** Decimal format (required)
   - **Image URL:** Direct link to image
   - **Description:** Item description
   - **Available:** Toggle for availability
3. Click "Add Food Item"

### Managing Orders

1. Go to "Orders" tab
2. Use filter dropdown to view specific status orders
3. Click status dropdown on any order to change status
4. View customer and delivery details in each order card
5. See itemized order contents

### Managing Users

1. Go to "Users" tab
2. View user list with statistics
3. Click "View" for detailed user information
4. Monitor user activity and spending

## Data Management

### Statistics Tracking

- **Users:** Active user count
- **Orders:** Total order count across all statuses
- **Revenue:** Sum of all delivered orders
- **Food Items:** Count of available items

### Order Status Flow

```
Pending → Processing → Out for Delivery → Delivered
                    ↘ Cancelled
```

## Future Enhancements

### Planned Features

- **Analytics Dashboard:** Charts and graphs for better insights
- **Inventory Management:** Stock tracking and low-stock alerts
- **Customer Communications:** Email/SMS notifications
- **Report Generation:** Export capabilities for reports
- **Advanced Filtering:** Search and filter across all sections
- **Bulk Operations:** Mass updates for items and orders
- **User Roles:** More granular permission system

### Technical Improvements

- **Real-time Notifications:** WebSocket integration
- **Image Upload:** Direct image upload instead of URLs
- **Data Export:** CSV/Excel export functionality
- **Advanced Analytics:** Revenue trends, popular items
- **Multi-language Support:** Internationalization

## Troubleshooting

### Common Issues

1. **Cannot Access Admin Panel**

   - Ensure logged in with admin email (contains 'admin')
   - Check browser console for errors
   - Verify backend server is running

2. **Data Not Loading**

   - Check network connection
   - Verify API endpoints are responding
   - Check browser developer tools for errors

3. **Cannot Update Items**
   - Ensure all required fields are filled
   - Check for validation errors
   - Verify admin permissions

### Support

- Check backend logs for detailed error information
- Use browser developer tools for frontend debugging
- Verify database connections and table structures

## Technical Architecture

### Frontend Components

```
AdminDashboard/
├── AdminDashboard.jsx     # Main dashboard component
├── AdminDashboard.css     # Styling and responsive design
└── Sub-components:
    ├── FoodItemDisplay    # Display food item cards
    └── EditFoodForm       # Inline editing form
```

### Backend Integration

- RESTful API endpoints
- JWT authentication
- Role-based access control
- Database operations with MariaDB
- Error handling and logging

The admin dashboard provides a complete management interface for running the food delivery business efficiently!
