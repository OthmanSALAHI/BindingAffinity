require('dotenv').config();
const { sql } = require('../config/database');
const bcrypt = require('bcryptjs');

async function initDatabase() {
  try {
    console.log('🚀 Initializing Vercel Postgres database...');
    
    // Create users table
    console.log('📋 Creating users table...');
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        bio TEXT,
        profile_image VARCHAR(255),
        is_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Users table created successfully');

    // Check if admin user exists
    const adminCheck = await sql`SELECT * FROM users WHERE email = 'admin@bioaffinity.com'`;
    
    if (adminCheck.rows.length === 0) {
      console.log('👤 Creating default admin user...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await sql`
        INSERT INTO users (username, email, password, is_admin)
        VALUES ('admin', 'admin@bioaffinity.com', ${hashedPassword}, true)
      `;
      console.log('✅ Admin user created successfully');
      console.log('📧 Email: admin@bioaffinity.com');
      console.log('🔑 Password: admin123');
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    console.log('✨ Database initialization complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

initDatabase();
