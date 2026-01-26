const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { db } = require('../config/database');
const { authenticateToken, adminMiddleware } = require('../middleware/auth');
const upload = require('../middleware/upload');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Register
router.post(
  '/register',
  [
    body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, email, password } = req.body;

      // Check if user exists
      const existingUser = db.prepare('SELECT * FROM users WHERE email = ? OR username = ?').get(email, username);
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert user
      const stmt = db.prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)');
      const result = stmt.run(username, email, hashedPassword);

      // Generate token
      const token = jwt.sign(
        { userId: result.lastInsertRowid, username, email, isAdmin: false },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: { id: result.lastInsertRowid, username, email, profile_image: null, is_admin: false }
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Find user
      const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
      if (!user) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      // Generate token
      const token = jwt.sign(
        { userId: user.id, username: user.username, email: user.email, isAdmin: !!user.is_admin },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          bio: user.bio,
          profile_image: user.profile_image,
          is_admin: !!user.is_admin
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Get current user
router.get('/me', authenticateToken, (req, res) => {
  try {
    const user = db.prepare('SELECT id, username, email, bio, profile_image, is_admin, created_at FROM users WHERE id = ?').get(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: { ...user, is_admin: !!user.is_admin } });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user profile
router.put(
  '/update-profile',
  authenticateToken,
  [
    body('username').optional().trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('email').optional().isEmail().withMessage('Please enter a valid email'),
    body('bio').optional().isLength({ max: 200 }).withMessage('Bio must be 200 characters or less')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, email, bio } = req.body;
      const userId = req.user.userId;

      // Check if username or email already exists (excluding current user)
      if (username) {
        const existingUsername = db.prepare('SELECT id FROM users WHERE username = ? AND id != ?').get(username, userId);
        if (existingUsername) {
          return res.status(400).json({ error: 'Username already taken' });
        }
      }

      if (email) {
        const existingEmail = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(email, userId);
        if (existingEmail) {
          return res.status(400).json({ error: 'Email already taken' });
        }
      }

      // Build dynamic update query
      const updates = [];
      const values = [];

      if (username !== undefined) {
        updates.push('username = ?');
        values.push(username);
      }
      if (email !== undefined) {
        updates.push('email = ?');
        values.push(email);
      }
      if (bio !== undefined) {
        updates.push('bio = ?');
        values.push(bio);
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      updates.push('updated_at = CURRENT_TIMESTAMP');
      values.push(userId);

      const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
      db.prepare(sql).run(...values);

      // Get updated user
      const updatedUser = db.prepare('SELECT id, username, email, bio, profile_image, created_at FROM users WHERE id = ?').get(userId);

      res.json({
        message: 'Profile updated successfully',
        user: updatedUser
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Upload profile image
router.post('/upload-profile-image', authenticateToken, upload.single('profile_image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Get current user to delete old image
    const user = db.prepare('SELECT profile_image FROM users WHERE id = ?').get(req.user.userId);
    
    if (user.profile_image) {
      const oldImagePath = path.join(__dirname, '..', 'uploads', 'profiles', user.profile_image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Update user with new image filename
    const stmt = db.prepare('UPDATE users SET profile_image = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    stmt.run(req.file.filename, req.user.userId);

    res.json({
      message: 'Profile image uploaded successfully',
      profile_image: req.file.filename
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete profile image
router.delete('/delete-profile-image', authenticateToken, (req, res) => {
  try {
    const user = db.prepare('SELECT profile_image FROM users WHERE id = ?').get(req.user.userId);
    
    if (!user.profile_image) {
      return res.status(400).json({ error: 'No profile image to delete' });
    }

    // Delete file from disk
    const imagePath = path.join(__dirname, '..', 'uploads', 'profiles', user.profile_image);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    // Update database
    const stmt = db.prepare('UPDATE users SET profile_image = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    stmt.run(req.user.userId);

    res.json({ message: 'Profile image deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ========== ADMIN ROUTES ==========

// Get all users (admin only)
router.get('/admin/users', authenticateToken, adminMiddleware, (req, res) => {
  try {
    const users = db.prepare('SELECT id, username, email, bio, profile_image, is_admin, created_at FROM users ORDER BY created_at DESC').all();
    
    res.json({ 
      users: users.map(user => ({ ...user, is_admin: !!user.is_admin }))
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create user (admin only)
router.post(
  '/admin/users',
  authenticateToken,
  adminMiddleware,
  [
    body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('is_admin').optional().isBoolean().withMessage('is_admin must be a boolean')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, email, password, is_admin = false } = req.body;

      // Check if user exists
      const existingUser = db.prepare('SELECT * FROM users WHERE email = ? OR username = ?').get(email, username);
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert user
      const stmt = db.prepare('INSERT INTO users (username, email, password, is_admin) VALUES (?, ?, ?, ?)');
      const result = stmt.run(username, email, hashedPassword, is_admin ? 1 : 0);

      const newUser = db.prepare('SELECT id, username, email, bio, profile_image, is_admin, created_at FROM users WHERE id = ?').get(result.lastInsertRowid);

      res.status(201).json({
        message: 'User created successfully',
        user: { ...newUser, is_admin: !!newUser.is_admin }
      });
    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Delete user (admin only)
router.delete('/admin/users/:id', authenticateToken, adminMiddleware, (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    // Prevent admin from deleting themselves
    if (userId === req.user.userId) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    // Get user to delete profile image if exists
    const user = db.prepare('SELECT profile_image FROM users WHERE id = ?').get(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete profile image if exists
    if (user.profile_image) {
      const imagePath = path.join(__dirname, '..', 'uploads', 'profiles', user.profile_image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Delete user from database
    const stmt = db.prepare('DELETE FROM users WHERE id = ?');
    const result = stmt.run(userId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user admin status (admin only)
router.patch('/admin/users/:id/admin-status', authenticateToken, adminMiddleware, (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { is_admin } = req.body;

    // Prevent admin from removing their own admin status
    if (userId === req.user.userId) {
      return res.status(400).json({ error: 'Cannot modify your own admin status' });
    }

    const stmt = db.prepare('UPDATE users SET is_admin = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    const result = stmt.run(is_admin ? 1 : 0, userId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedUser = db.prepare('SELECT id, username, email, bio, profile_image, is_admin, created_at FROM users WHERE id = ?').get(userId);

    res.json({
      message: 'User admin status updated successfully',
      user: { ...updatedUser, is_admin: !!updatedUser.is_admin }
    });
  } catch (error) {
    console.error('Update admin status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
