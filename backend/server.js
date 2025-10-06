require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('./database');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// JWT Secret (should be in .env in production)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Root route - API documentation
app.get('/', (req, res) => {
    res.json({
        message: 'Food Delivery API Server',
        version: '1.0.0',
        status: 'running',
        endpoints: {
            health: 'GET /api/health',
            auth: {
                register: 'POST /api/auth/register',
                login: 'POST /api/auth/login'
            },
            public: {
                categories: 'GET /api/categories',
                foodItems: 'GET /api/food-items',
                foodItem: 'GET /api/food-items/:id'
            },
            protected: {
                cart: 'GET /api/cart',
                addToCart: 'POST /api/cart/add',
                updateCart: 'PUT /api/cart/update',
                clearCart: 'DELETE /api/cart/clear',
                addresses: 'GET /api/addresses',
                addAddress: 'POST /api/addresses',
                orders: 'GET /api/orders',
                placeOrder: 'POST /api/orders',
                profile: 'GET /api/profile',
                updateProfile: 'PUT /api/profile'
            }
        },
        documentation: 'All protected endpoints require Authorization: Bearer <token> header'
    });
});

// Auth middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// User Authentication Routes
app.post('/api/auth/register', async (req, res) => {
    let conn;
    try {
        const { name, email, password, phone } = req.body;

        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required' });
        }

        conn = await db.getConnection();
        
        // Check if user already exists
        const existingUser = await conn.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ error: 'User already exists with this email' });
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create user
        const userUuid = uuidv4();
        await conn.query(
            'INSERT INTO users (uuid, name, email, password, phone) VALUES (?, ?, ?, ?, ?)',
            [userUuid, name, email, hashedPassword, phone]
        );

        // Generate JWT token
        const token = jwt.sign({ uuid: userUuid, email }, JWT_SECRET, { expiresIn: '24h' });

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: { uuid: userUuid, name, email, phone }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        if (conn) conn.release();
    }
});

app.post('/api/auth/login', async (req, res) => {
    let conn;
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        conn = await db.getConnection();
        
        // Find user
        const users = await conn.query('SELECT * FROM users WHERE email = ? AND status = "active"', [email]);
        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = users[0];

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign({ uuid: user.uuid, email: user.email }, JWT_SECRET, { expiresIn: '24h' });

        res.json({
            message: 'Login successful',
            token,
            user: { 
                uuid: user.uuid, 
                name: user.name, 
                email: user.email, 
                phone: user.phone,
                avatar: user.avatar
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        if (conn) conn.release();
    }
});

// Categories Routes
app.get('/api/categories', async (req, res) => {
    let conn;
    try {
        conn = await db.getConnection();
        const categories = await conn.query('SELECT * FROM categories ORDER BY name');
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        if (conn) conn.release();
    }
});

// Food Items Routes
app.get('/api/food-items', async (req, res) => {
    let conn;
    try {
        conn = await db.getConnection();
        const { category_id } = req.query;
        
        let query = `
            SELECT fi.*, c.name as category_name 
            FROM food_items fi 
            JOIN categories c ON fi.category_id = c.id 
            WHERE fi.is_available = 1
        `;
        let params = [];

        if (category_id) {
            query += ' AND fi.category_id = ?';
            params.push(category_id);
        }

        query += ' ORDER BY fi.name';
        
        const foodItems = await conn.query(query, params);
        res.json(foodItems);
    } catch (error) {
        console.error('Error fetching food items:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        if (conn) conn.release();
    }
});

app.get('/api/food-items/:id', async (req, res) => {
    let conn;
    try {
        conn = await db.getConnection();
        const foodItems = await conn.query(`
            SELECT fi.*, c.name as category_name 
            FROM food_items fi 
            JOIN categories c ON fi.category_id = c.id 
            WHERE fi.id = ? AND fi.is_available = 1
        `, [req.params.id]);

        if (foodItems.length === 0) {
            return res.status(404).json({ error: 'Food item not found' });
        }

        res.json(foodItems[0]);
    } catch (error) {
        console.error('Error fetching food item:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        if (conn) conn.release();
    }
});

// Cart Routes
app.get('/api/cart', authenticateToken, async (req, res) => {
    let conn;
    try {
        conn = await db.getConnection();
        
        // Get user ID from UUID
        const users = await conn.query('SELECT id FROM users WHERE uuid = ?', [req.user.uuid]);
        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        const userId = users[0].id;

        const cartItems = await conn.query(`
            SELECT ci.*, fi.name, fi.price, fi.image_url, fi.description
            FROM cart_items ci
            JOIN food_items fi ON ci.food_item_id = fi.id
            WHERE ci.user_id = ?
        `, [userId]);

        res.json(cartItems);
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        if (conn) conn.release();
    }
});

app.post('/api/cart/add', authenticateToken, async (req, res) => {
    let conn;
    try {
        const { food_item_id, quantity = 1 } = req.body;

        if (!food_item_id) {
            return res.status(400).json({ error: 'Food item ID is required' });
        }

        conn = await db.getConnection();
        
        // Get user ID from UUID
        const users = await conn.query('SELECT id FROM users WHERE uuid = ?', [req.user.uuid]);
        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        const userId = users[0].id;

        // Check if item already in cart
        const existingItem = await conn.query(
            'SELECT * FROM cart_items WHERE user_id = ? AND food_item_id = ?',
            [userId, food_item_id]
        );

        if (existingItem.length > 0) {
            // Update quantity
            await conn.query(
                'UPDATE cart_items SET quantity = quantity + ? WHERE user_id = ? AND food_item_id = ?',
                [quantity, userId, food_item_id]
            );
        } else {
            // Add new item
            await conn.query(
                'INSERT INTO cart_items (user_id, food_item_id, quantity) VALUES (?, ?, ?)',
                [userId, food_item_id, quantity]
            );
        }

        res.json({ message: 'Item added to cart successfully' });
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        if (conn) conn.release();
    }
});

app.put('/api/cart/update', authenticateToken, async (req, res) => {
    let conn;
    try {
        const { food_item_id, quantity } = req.body;

        if (!food_item_id || quantity === undefined) {
            return res.status(400).json({ error: 'Food item ID and quantity are required' });
        }

        conn = await db.getConnection();
        
        // Get user ID from UUID
        const users = await conn.query('SELECT id FROM users WHERE uuid = ?', [req.user.uuid]);
        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        const userId = users[0].id;

        if (quantity <= 0) {
            // Remove item from cart
            await conn.query(
                'DELETE FROM cart_items WHERE user_id = ? AND food_item_id = ?',
                [userId, food_item_id]
            );
        } else {
            // Update quantity
            await conn.query(
                'UPDATE cart_items SET quantity = ? WHERE user_id = ? AND food_item_id = ?',
                [quantity, userId, food_item_id]
            );
        }

        res.json({ message: 'Cart updated successfully' });
    } catch (error) {
        console.error('Error updating cart:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        if (conn) conn.release();
    }
});

app.delete('/api/cart/clear', authenticateToken, async (req, res) => {
    let conn;
    try {
        conn = await db.getConnection();
        
        // Get user ID from UUID
        const users = await conn.query('SELECT id FROM users WHERE uuid = ?', [req.user.uuid]);
        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        const userId = users[0].id;

        await conn.query('DELETE FROM cart_items WHERE user_id = ?', [userId]);
        res.json({ message: 'Cart cleared successfully' });
    } catch (error) {
        console.error('Error clearing cart:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        if (conn) conn.release();
    }
});

// Address Routes
app.get('/api/addresses', authenticateToken, async (req, res) => {
    let conn;
    try {
        conn = await db.getConnection();
        
        // Get user ID from UUID
        const users = await conn.query('SELECT id FROM users WHERE uuid = ?', [req.user.uuid]);
        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        const userId = users[0].id;

        const addresses = await conn.query('SELECT * FROM addresses WHERE user_id = ?', [userId]);
        res.json(addresses);
    } catch (error) {
        console.error('Error fetching addresses:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        if (conn) conn.release();
    }
});

app.post('/api/addresses', authenticateToken, async (req, res) => {
    let conn;
    try {
        const { address, street, apartment, city, province, is_default = false } = req.body;

        if (!address || !street || !city || !province) {
            return res.status(400).json({ error: 'Address, street, city, and province are required' });
        }

        conn = await db.getConnection();
        
        // Get user ID from UUID
        const users = await conn.query('SELECT id FROM users WHERE uuid = ?', [req.user.uuid]);
        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        const userId = users[0].id;

        // If this is default, unset other defaults
        if (is_default) {
            await conn.query('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [userId]);
        }

        const result = await conn.query(
            'INSERT INTO addresses (user_id, address, street, apartment, city, province, is_default) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [userId, address, street, apartment, city, province, is_default]
        );

        res.status(201).json({ 
            id: result.insertId, 
            message: 'Address added successfully' 
        });
    } catch (error) {
        console.error('Error adding address:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        if (conn) conn.release();
    }
});

// Orders Routes
app.get('/api/orders', authenticateToken, async (req, res) => {
    let conn;
    try {
        conn = await db.getConnection();
        
        // Get user ID from UUID
        const users = await conn.query('SELECT id FROM users WHERE uuid = ?', [req.user.uuid]);
        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        const userId = users[0].id;

        const orders = await conn.query(`
            SELECT o.*, a.address, a.street, a.city, a.province
            FROM orders o
            JOIN addresses a ON o.delivery_address_id = a.id
            WHERE o.user_id = ?
            ORDER BY o.created_at DESC
        `, [userId]);

        // Get order items for each order
        for (let order of orders) {
            const items = await conn.query(`
                SELECT oi.*, fi.name, fi.image_url
                FROM order_items oi
                LEFT JOIN food_items fi ON oi.food_item_id = fi.id
                WHERE oi.order_id = ?
            `, [order.id]);
            order.items = items;
        }

        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        if (conn) conn.release();
    }
});

app.post('/api/orders', authenticateToken, async (req, res) => {
    let conn;
    try {
        const { delivery_address_id, payment_method, notes } = req.body;

        if (!delivery_address_id || !payment_method) {
            return res.status(400).json({ error: 'Delivery address and payment method are required' });
        }

        conn = await db.getConnection();
        
        // Get user ID from UUID
        const users = await conn.query('SELECT id FROM users WHERE uuid = ?', [req.user.uuid]);
        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        const userId = users[0].id;

        // Get cart items
        const cartItems = await conn.query(`
            SELECT ci.*, fi.price
            FROM cart_items ci
            JOIN food_items fi ON ci.food_item_id = fi.id
            WHERE ci.user_id = ?
        `, [userId]);

        if (cartItems.length === 0) {
            return res.status(400).json({ error: 'Cart is empty' });
        }

        // Calculate totals
        let subtotal = 0;
        for (let item of cartItems) {
            subtotal += item.price * item.quantity;
        }
        const deliveryFee = 2.00; // Fixed delivery fee
        const grandTotal = subtotal + deliveryFee;

        // Create order
        const orderResult = await conn.query(`
            INSERT INTO orders (user_id, delivery_address_id, subtotal, delivery_fee, grand_total, payment_method, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [userId, delivery_address_id, subtotal, deliveryFee, grandTotal, payment_method, notes]);

        const orderId = orderResult.insertId;

        // Create order items
        for (let item of cartItems) {
            await conn.query(`
                INSERT INTO order_items (order_id, food_item_id, quantity, price_at_purchase)
                VALUES (?, ?, ?, ?)
            `, [orderId, item.food_item_id, item.quantity, item.price]);
        }

        // Clear cart
        await conn.query('DELETE FROM cart_items WHERE user_id = ?', [userId]);

        res.status(201).json({
            order_id: orderId,
            message: 'Order placed successfully',
            total: grandTotal
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        if (conn) conn.release();
    }
});

// User Profile Routes
app.get('/api/profile', authenticateToken, async (req, res) => {
    let conn;
    try {
        conn = await db.getConnection();
        
        const users = await conn.query('SELECT uuid, name, email, phone, avatar FROM users WHERE uuid = ?', [req.user.uuid]);
        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(users[0]);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        if (conn) conn.release();
    }
});

app.put('/api/profile', authenticateToken, async (req, res) => {
    let conn;
    try {
        const { name, phone, avatar } = req.body;

        conn = await db.getConnection();
        
        await conn.query(
            'UPDATE users SET name = ?, phone = ?, avatar = ? WHERE uuid = ?',
            [name, phone, avatar, req.user.uuid]
        );

        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        if (conn) conn.release();
    }
});

// Admin middleware (simple role check - in production, use proper role-based auth)
const requireAdmin = (req, res, next) => {
    // For now, we'll check if the user email contains 'admin'
    // In production, you should have a proper roles table
    if (!req.user.email || !req.user.email.includes('admin')) {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

// Admin Routes
app.get('/api/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
    let conn;
    try {
        conn = await db.getConnection();
        
        // Get statistics
        const userCount = await conn.query('SELECT COUNT(*) as count FROM users WHERE status = "active"');
        const orderCount = await conn.query('SELECT COUNT(*) as count FROM orders');
        const revenueResult = await conn.query('SELECT SUM(grand_total) as total FROM orders WHERE order_status = "delivered"');
        const foodCount = await conn.query('SELECT COUNT(*) as count FROM food_items WHERE is_available = 1');

        res.json({
            totalUsers: userCount[0].count,
            totalOrders: orderCount[0].count,
            totalRevenue: revenueResult[0].total || 0,
            totalFoodItems: foodCount[0].count
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        if (conn) conn.release();
    }
});

app.get('/api/admin/food-items', authenticateToken, requireAdmin, async (req, res) => {
    let conn;
    try {
        conn = await db.getConnection();
        const foodItems = await conn.query(`
            SELECT fi.*, c.name as category_name 
            FROM food_items fi 
            JOIN categories c ON fi.category_id = c.id 
            ORDER BY fi.name
        `);
        res.json(foodItems);
    } catch (error) {
        console.error('Error fetching admin food items:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        if (conn) conn.release();
    }
});

app.post('/api/admin/food-items', authenticateToken, requireAdmin, async (req, res) => {
    let conn;
    try {
        const { name, category_id, description, price, image_url, is_available } = req.body;

        if (!name || !category_id || !price) {
            return res.status(400).json({ error: 'Name, category, and price are required' });
        }

        conn = await db.getConnection();
        
        const result = await conn.query(
            'INSERT INTO food_items (name, category_id, description, price, image_url, is_available) VALUES (?, ?, ?, ?, ?, ?)',
            [name, category_id, description, price, image_url, is_available ?? true]
        );

        res.status(201).json({
            id: result.insertId,
            message: 'Food item created successfully'
        });
    } catch (error) {
        console.error('Error creating food item:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        if (conn) conn.release();
    }
});

app.put('/api/admin/food-items/:id', authenticateToken, requireAdmin, async (req, res) => {
    let conn;
    try {
        const { id } = req.params;
        const { name, category_id, description, price, image_url, is_available } = req.body;

        conn = await db.getConnection();
        
        await conn.query(
            'UPDATE food_items SET name = ?, category_id = ?, description = ?, price = ?, image_url = ?, is_available = ? WHERE id = ?',
            [name, category_id, description, price, image_url, is_available, id]
        );

        res.json({ message: 'Food item updated successfully' });
    } catch (error) {
        console.error('Error updating food item:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        if (conn) conn.release();
    }
});

app.delete('/api/admin/food-items/:id', authenticateToken, requireAdmin, async (req, res) => {
    let conn;
    try {
        const { id } = req.params;

        conn = await db.getConnection();
        
        await conn.query('DELETE FROM food_items WHERE id = ?', [id]);

        res.json({ message: 'Food item deleted successfully' });
    } catch (error) {
        console.error('Error deleting food item:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        if (conn) conn.release();
    }
});

app.get('/api/admin/orders', authenticateToken, requireAdmin, async (req, res) => {
    let conn;
    try {
        conn = await db.getConnection();
        
        const orders = await conn.query(`
            SELECT o.*, u.name as customer_name, u.email as customer_email,
                   CONCAT(a.address, ', ', a.street, ', ', a.city, ', ', a.province) as delivery_address
            FROM orders o
            JOIN users u ON o.user_id = u.id
            JOIN addresses a ON o.delivery_address_id = a.id
            ORDER BY o.created_at DESC
        `);

        // Get order items for each order
        for (let order of orders) {
            const items = await conn.query(`
                SELECT oi.*, fi.name, fi.image_url
                FROM order_items oi
                LEFT JOIN food_items fi ON oi.food_item_id = fi.id
                WHERE oi.order_id = ?
            `, [order.id]);
            order.items = items;
        }

        res.json(orders);
    } catch (error) {
        console.error('Error fetching admin orders:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        if (conn) conn.release();
    }
});

app.put('/api/admin/orders/:id/status', authenticateToken, requireAdmin, async (req, res) => {
    let conn;
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['pending', 'processing', 'out_for_delivery', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid order status' });
        }

        conn = await db.getConnection();
        
        await conn.query('UPDATE orders SET order_status = ? WHERE id = ?', [status, id]);

        res.json({ message: 'Order status updated successfully' });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        if (conn) conn.release();
    }
});

app.get('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
    let conn;
    try {
        conn = await db.getConnection();
        
        const users = await conn.query(`
            SELECT u.id, u.uuid, u.name, u.email, u.phone, u.status,
                   COUNT(o.id) as total_orders,
                   COALESCE(SUM(o.grand_total), 0) as total_spent
            FROM users u
            LEFT JOIN orders o ON u.id = o.user_id
            GROUP BY u.id
            ORDER BY u.id DESC
        `);

        res.json(users);
    } catch (error) {
        console.error('Error fetching admin users:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        if (conn) conn.release();
    }
});

// Categories management for admin
app.post('/api/admin/categories', authenticateToken, requireAdmin, async (req, res) => {
    let conn;
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Category name is required' });
        }

        conn = await db.getConnection();
        
        const result = await conn.query('INSERT INTO categories (name) VALUES (?)', [name]);

        res.status(201).json({
            id: result.insertId,
            message: 'Category created successfully'
        });
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        if (conn) conn.release();
    }
});

// Test database connection
app.get('/api/health', async (req, res) => {
    let conn;
    try {
        conn = await db.getConnection();
        res.json({ status: 'OK', message: 'Database connected successfully' });
    } catch (error) {
        res.status(500).json({ status: 'ERROR', message: 'Database connection failed' });
    } finally {
        if (conn) conn.release();
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
