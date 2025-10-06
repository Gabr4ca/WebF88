require('dotenv').config();
const db = require('./database');

const sampleFoodItems = [
    // Salads (category_id = 1)
    {category_id: 1, name: 'Greek Salad', description: 'Fresh lettuce, tomatoes, olives, feta cheese with olive oil dressing', price: 12.99, image_url: 'food_1.png'},
    {category_id: 1, name: 'Veg Salad', description: 'Mixed vegetables with fresh herbs and vinaigrette', price: 10.99, image_url: 'food_2.png'},
    {category_id: 1, name: 'Caesar Salad', description: 'Classic caesar salad with croutons and parmesan cheese', price: 11.99, image_url: 'food_3.png'},
    {category_id: 1, name: 'Chicken Salad', description: 'Grilled chicken breast over mixed greens', price: 14.99, image_url: 'food_4.png'},
    
    // Rolls (category_id = 2)
    {category_id: 2, name: 'Veg Rolls', description: 'Fresh vegetable rolls with spicy dipping sauce', price: 8.99, image_url: 'food_5.png'},
    {category_id: 2, name: 'Chicken Rolls', description: 'Tender chicken wrapped in soft tortilla', price: 9.99, image_url: 'food_6.png'},
    {category_id: 2, name: 'Spring Rolls', description: 'Crispy spring rolls with vegetables', price: 7.99, image_url: 'food_7.png'},
    {category_id: 2, name: 'Peri Peri Rolls', description: 'Spicy peri peri chicken rolls', price: 10.99, image_url: 'food_8.png'},
    
    // Desserts (category_id = 3)
    {category_id: 3, name: 'Ripple Ice Cream', description: 'Creamy vanilla ice cream with chocolate ripple', price: 6.99, image_url: 'food_9.png'},
    {category_id: 3, name: 'Fruit Ice Cream', description: 'Fresh fruit flavored ice cream', price: 5.99, image_url: 'food_10.png'},
    {category_id: 3, name: 'Jar Ice Cream', description: 'Premium ice cream served in a jar', price: 7.99, image_url: 'food_11.png'},
    {category_id: 3, name: 'Vanilla Ice Cream', description: 'Classic vanilla ice cream', price: 5.49, image_url: 'food_12.png'},
    
    // Sandwiches (category_id = 4)
    {category_id: 4, name: 'Chicken Sandwich', description: 'Grilled chicken with lettuce and mayo', price: 8.99, image_url: 'food_13.png'},
    {category_id: 4, name: 'Vegan Sandwich', description: 'Fresh vegetables with vegan mayo', price: 7.99, image_url: 'food_14.png'},
    {category_id: 4, name: 'Grilled Sandwich', description: 'Toasted sandwich with cheese and vegetables', price: 6.99, image_url: 'food_15.png'},
    {category_id: 4, name: 'Bread Sandwich', description: 'Simple but delicious bread sandwich', price: 5.99, image_url: 'food_16.png'},
];

async function populateDatabase() {
    let conn;
    try {
        conn = await db.getConnection();
        
        console.log('Connected to database. Populating with sample data...');
        
        // Check if food items already exist
        const existingItems = await conn.query('SELECT COUNT(*) as count FROM food_items');
        if (existingItems[0].count > 0) {
            console.log('Database already contains food items. Skipping population.');
            return;
        }
        
        // Insert sample food items
        for (const item of sampleFoodItems) {
            await conn.query(
                'INSERT INTO food_items (category_id, name, description, price, image_url) VALUES (?, ?, ?, ?, ?)',
                [item.category_id, item.name, item.description, item.price, item.image_url]
            );
        }
        
        console.log(`Successfully inserted ${sampleFoodItems.length} food items!`);
        
    } catch (error) {
        console.error('Error populating database:', error);
    } finally {
        if (conn) conn.release();
        process.exit();
    }
}

populateDatabase();