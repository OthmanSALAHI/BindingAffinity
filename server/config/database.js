const { Pool } = require('pg');

// Create a connection pool using the POSTGRES_URL from environment
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Helper function to execute queries
const sql = async (strings, ...values) => {
  const client = await pool.connect();
  try {
    let query = '';
    let params = [];
    
    // Build the query from template literal
    for (let i = 0; i < strings.length; i++) {
      query += strings[i];
      if (i < values.length) {
        params.push(values[i]);
        query += `$${params.length}`;
      }
    }
    
    const result = await client.query(query, params);
    return { rows: result.rows, rowCount: result.rowCount };
  } finally {
    client.release();
  }
};

// Add query method for raw queries
sql.query = async (text, params) => {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return { rows: result.rows, rowCount: result.rowCount };
  } finally {
    client.release();
  }
};

// Create users table
const createUsersTable = async () => {
  try {
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
    console.log('Users table created successfully');
  } catch (error) {
    console.error('Error creating users table:', error);
  }
};

// Initialize database
const initDatabase = async () => {
  await createUsersTable();
};

module.exports = { sql, initDatabase };
