require('dotenv').config();
const db = require('./database');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

async function createAdminUser() {
    let conn;
    try {
        conn = await db.getConnection();
        
        console.log('Creating admin user...');
        
        // Check if admin user already exists
        const existingAdmin = await conn.query('SELECT id FROM users WHERE email = ?', ['admin@fooddelivery.com']);
        if (existingAdmin.length > 0) {
            console.log('Admin user already exists!');
            console.log('Email: admin@fooddelivery.com');
            console.log('Password: admin123');
            return;
        }
        
        // Create admin user
        const adminData = {
            uuid: uuidv4(),
            name: 'Admin User',
            email: 'admin@fooddelivery.com',
            password: await bcrypt.hash('admin123', 10),
            phone: '1234567890',
            status: 'active'
        };
        
        await conn.query(
            'INSERT INTO users (uuid, name, email, password, phone, status) VALUES (?, ?, ?, ?, ?, ?)',
            [adminData.uuid, adminData.name, adminData.email, adminData.password, adminData.phone, adminData.status]
        );
        
        console.log('Admin user created successfully!');
        console.log('Email: admin@fooddelivery.com');
        console.log('Password: admin123');
        console.log('');
        console.log('You can now log in with these credentials to access the admin panel at /admin');
        
    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        if (conn) conn.release();
        process.exit();
    }
}

createAdminUser();