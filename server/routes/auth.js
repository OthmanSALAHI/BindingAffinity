const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { sql } = require('../config/database');
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
      const existingUser = await sql`SELECT * FROM users WHERE email = ${email} OR username = ${username}`;
      if (existingUser.rows.length > 0) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert user
      const result = await sql`
        INSERT INTO users (username, email, password) 
        VALUES (${username}, ${email}, ${hashedPassword})
        RETURNING id, username, email, profile_image, is_admin
      `;

      const newUser = result.rows[0];

      // Generate token
      const token = jwt.sign(
        { userId: newUser.id, username: newUser.username, email: newUser.email, isAdmin: newUser.is_admin },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: { ...newUser, is_admin: newUser.is_admin }
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
      const result = await sql`SELECT * FROM users WHERE email = ${email}`;
      const user = result.rows[0];
      
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
        { userId: user.id, username: user.username, email: user.email, isAdmin: user.is_admin },
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
          is_admin: user.is_admin
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const result = await sql`
      SELECT id, username, email, bio, profile_image, is_admin, created_at 
      FROM users 
      WHERE id = ${req.user.userId}
    `;
    
    const user = result.rows[0];
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
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
        const existingUsername = await sql`
          SELECT id FROM users WHERE username = ${username} AND id != ${userId}
        `;
        if (existingUsername.rows.length > 0) {
          return res.status(400).json({ error: 'Username already taken' });
        }
      }

      if (email) {
        const existingEmail = await sql`
          SELECT id FROM users WHERE email = ${email} AND id != ${userId}
        `;
        if (existingEmail.rows.length > 0) {
          return res.status(400).json({ error: 'Email already taken' });
        }
      }

      // Build update query dynamically
      const updates = [];
      if (username !== undefined) updates.push(`username = '${username}'`);
      if (email !== undefined) updates.push(`email = '${email}'`);
      if (bio !== undefined) updates.push(`bio = '${bio}'`);

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      // Perform update
      if (username !== undefined && email !== undefined && bio !== undefined) {
        await sql`
          UPDATE users 
          SET username = ${username}, email = ${email}, bio = ${bio}, updated_at = CURRENT_TIMESTAMP 
          WHERE id = ${userId}
        `;
      } else if (username !== undefined && email !== undefined) {
        await sql`
          UPDATE users 
          SET username = ${username}, email = ${email}, updated_at = CURRENT_TIMESTAMP 
          WHERE id = ${userId}
        `;
      } else if (username !== undefined && bio !== undefined) {
        await sql`
          UPDATE users 
          SET username = ${username}, bio = ${bio}, updated_at = CURRENT_TIMESTAMP 
          WHERE id = ${userId}
        `;
      } else if (email !== undefined && bio !== undefined) {
        await sql`
          UPDATE users 
          SET email = ${email}, bio = ${bio}, updated_at = CURRENT_TIMESTAMP 
          WHERE id = ${userId}
        `;
      } else if (username !== undefined) {
        await sql`UPDATE users SET username = ${username}, updated_at = CURRENT_TIMESTAMP WHERE id = ${userId}`;
      } else if (email !== undefined) {
        await sql`UPDATE users SET email = ${email}, updated_at = CURRENT_TIMESTAMP WHERE id = ${userId}`;
      } else if (bio !== undefined) {
        await sql`UPDATE users SET bio = ${bio}, updated_at = CURRENT_TIMESTAMP WHERE id = ${userId}`;
      }

      // Get updated user
      const updatedUserResult = await sql`
        SELECT id, username, email, bio, profile_image, created_at 
        FROM users 
        WHERE id = ${userId}
      `;
      const updatedUser = updatedUserResult.rows[0];

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
router.post('/upload-profile-image', authenticateToken, upload.single('profile_image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Get current user to delete old image
    const userResult = await sql`SELECT profile_image FROM users WHERE id = ${req.user.userId}`;
    const user = userResult.rows[0];
    
    if (user && user.profile_image) {
      const oldImagePath = path.join(__dirname, '..', 'uploads', 'profiles', user.profile_image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Update user with new image filename
    await sql`
      UPDATE users 
      SET profile_image = ${req.file.filename}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ${req.user.userId}
    `;

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
router.delete('/delete-profile-image', authenticateToken, async (req, res) => {
  try {
    const userResult = await sql`SELECT profile_image FROM users WHERE id = ${req.user.userId}`;
    const user = userResult.rows[0];
    
    if (!user || !user.profile_image) {
      return res.status(400).json({ error: 'No profile image to delete' });
    }

    // Delete file from disk
    const imagePath = path.join(__dirname, '..', 'uploads', 'profiles', user.profile_image);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    // Update database
    await sql`
      UPDATE users 
      SET profile_image = NULL, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ${req.user.userId}
    `;

    res.json({ message: 'Profile image deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ========== ADMIN ROUTES ==========

// Get all users (admin only)
router.get('/admin/users', authenticateToken, adminMiddleware, async (req, res) => {
  try {
    const result = await sql`
      SELECT id, username, email, bio, profile_image, is_admin, created_at 
      FROM users 
      ORDER BY created_at DESC
    `;
    
    res.json({ users: result.rows });
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
      const existingUser = await sql`
        SELECT * FROM users WHERE email = ${email} OR username = ${username}
      `;
      if (existingUser.rows.length > 0) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert user
      const result = await sql`
        INSERT INTO users (username, email, password, is_admin) 
        VALUES (${username}, ${email}, ${hashedPassword}, ${is_admin})
        RETURNING id, username, email, bio, profile_image, is_admin, created_at
      `;

      const newUser = result.rows[0];

      res.status(201).json({
        message: 'User created successfully',
        user: newUser
      });
    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Delete user (admin only)
router.delete('/admin/users/:id', authenticateToken, adminMiddleware, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    // Prevent admin from deleting themselves
    if (userId === req.user.userId) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    // Get user to delete profile image if exists
    const userResult = await sql`SELECT profile_image FROM users WHERE id = ${userId}`;
    const user = userResult.rows[0];
    
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
    const result = await sql`DELETE FROM users WHERE id = ${userId}`;

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user admin status (admin only)
router.patch('/admin/users/:id/admin-status', authenticateToken, adminMiddleware, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { is_admin } = req.body;

    // Prevent admin from removing their own admin status
    if (userId === req.user.userId) {
      return res.status(400).json({ error: 'Cannot modify your own admin status' });
    }

    const result = await sql`
      UPDATE users 
      SET is_admin = ${is_admin}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ${userId}
      RETURNING id, username, email, bio, profile_image, is_admin, created_at
    `;

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedUser = result.rows[0];

    res.json({
      message: 'User admin status updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update admin status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
