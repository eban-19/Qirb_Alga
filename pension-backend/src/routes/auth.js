const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { executeQuery } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName, phone, role = 'Owner' } = req.body;

    // Validate input
    if (!email || !password || !fullName) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and full name are required'
      });
    }

    // Check if user already exists
    const existingUser = await executeQuery(
      'SELECT user_id FROM Users WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const result = await executeQuery(
      'INSERT INTO Users (full_name, email, phone, password_hash, role, status) VALUES (?, ?, ?, ?, ?, ?)',
      [fullName, email, phone, hashedPassword, role, 'Approved']
    );

    // Get created user
    const newUser = await executeQuery(
      'SELECT user_id, full_name, email, phone, role, created_at FROM Users WHERE user_id = ?',
      [result.insertId]
    );

    if (!newUser || newUser.length === 0) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create user'
      });
    }

    // Auto-login for pension owners (role = 'Owner')
    if (role === 'Owner' || role === 'Admin') {
      // Create JWT token
      const token = jwt.sign(
        { 
          userId: newUser[0].user_id, 
          email: newUser[0].email, 
          role: newUser[0].role 
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      res.status(201).json({
        success: true,
        message: 'Pension owner registered successfully',
        data: {
          user: {
            id: newUser[0].user_id,
            email: newUser[0].email,
            full_name: newUser[0].full_name,
            phone: newUser[0].phone,
            role: newUser[0].role.toLowerCase(),
            created_at: newUser[0].created_at
          },
          token: token
        }
      });
    } else {
      // Regular customers need approval
      res.status(201).json({
        success: true,
        message: 'User registered successfully. Please wait for admin approval.',
        data: {
          user: {
            id: newUser[0].user_id,
            email: newUser[0].email,
            full_name: newUser[0].full_name,
            phone: newUser[0].phone,
            role: newUser[0].role.toLowerCase(),
            created_at: newUser[0].created_at
          }
        }
      });
    }

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user
    const users = await executeQuery(
      'SELECT user_id, email, password_hash, full_name, phone, role, status FROM Users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const user = users[0];

    // Check if user is approved
    if (user.status !== 'Approved') {
      return res.status(401).json({
        success: false,
        message: 'Account is not approved. Please wait for admin approval.'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.user_id,
        email: user.email,
        role: user.role.toLowerCase()
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Remove password from response
    delete user.password_hash;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.user_id,
          email: user.email,
          full_name: user.full_name,
          phone: user.phone,
          role: user.role.toLowerCase(),
          created_at: user.created_at
        },
        token: token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get user profile (protected route)
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const users = await executeQuery(
      'SELECT user_id, full_name, email, phone, role, status, created_at FROM Users WHERE user_id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: users[0]
      }
    });

  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Logout route
router.post('/logout', async (req, res) => {
  try {
    // In a real app, you might want to blacklist the token or perform other cleanup
    // For now, just return success
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
