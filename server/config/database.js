const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const db = new Database(path.join(__dirname, '..', 'database.sqlite'), { verbose: console.log });

// Create users table
const createUsersTable = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      bio TEXT,
      profile_image TEXT,
      is_admin INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;
  db.exec(sql);
  console.log('Users table created successfully');
  
  // Add bio column if it doesn't exist (for existing databases)
  try {
    db.exec('ALTER TABLE users ADD COLUMN bio TEXT');
    console.log('Bio column added to users table');
  } catch (error) {
    // Column already exists, ignore error
  }
  
  // Add is_admin column if it doesn't exist (for existing databases)
  try {
    db.exec('ALTER TABLE users ADD COLUMN is_admin INTEGER DEFAULT 0');
    console.log('is_admin column added to users table');
  } catch (error) {
    // Column already exists, ignore error
  }
};

// Initialize database
const initDatabase = () => {
  createUsersTable();
};

module.exports = { db, initDatabase };
