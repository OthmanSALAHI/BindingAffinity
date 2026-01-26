require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase } = require('./config/database');
const authRoutes = require('./routes/auth');
const databaseRoutes = require('./routes/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize database
initDatabase();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file serving for uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/database', databaseRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Setup endpoint to create first admin (one-time use)
app.post('/api/setup-admin', async (req, res) => {
  try {
    const { db } = require('./config/database');
    const bcrypt = require('bcryptjs');
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if any admin exists
    const existingAdmin = db.prepare('SELECT * FROM users WHERE is_admin = 1').get();
    if (existingAdmin) {
      return res.status(400).json({ error: 'Admin already exists. Please login or contact existing admin.' });
    }

    // Check if user with email exists
    const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    
    if (existingUser) {
      // Make existing user an admin
      db.prepare('UPDATE users SET is_admin = 1 WHERE email = ?').run(email);
      return res.json({ 
        message: 'User promoted to admin successfully',
        email: email
      });
    } else {
      // Create new admin user
      const hashedPassword = await bcrypt.hash(password, 10);
      const username = email.split('@')[0]; // Use email prefix as username
      
      const stmt = db.prepare('INSERT INTO users (username, email, password, is_admin) VALUES (?, ?, ?, 1)');
      stmt.run(username, email, hashedPassword);
      
      return res.status(201).json({ 
        message: 'Admin user created successfully',
        email: email,
        username: username
      });
    }
  } catch (error) {
    console.error('Setup admin error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});
