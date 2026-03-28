const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { executeQuery } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { 
      email, 
      password, 
      fullName, 
      phone, 
      role = 'owner', 
      businessName,
      businessEmail,
      businessPhone,
      licenseNumber,
      documentUrl
    } = req.body;

    // Validate input
    if (!email || !password || !fullName) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and full name are required'
      });
    }

    // Check if user already exists
    const existingUser = await executeQuery(
      'SELECT user_id FROM users WHERE email = ?',
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

    // Create user with pending approval status
    const result = await executeQuery(
      'INSERT INTO users (full_name, email, phone, password_hash, role, approved) VALUES (?, ?, ?, ?, ?, ?)',
      [fullName, email, phone, hashedPassword, role, 0] // 0 = pending approval
    );

    // Get created user
    const newUser = await executeQuery(
      'SELECT user_id, full_name, email, phone, role, approved, created_at FROM users WHERE user_id = ?',
      [result.insertId]
    );

    if (!newUser || newUser.length === 0) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create user'
      });
    }

    // Create owner profile for new owners
    if ((role === 'owner' || role === 'Owner')) {
      try {
        console.log('🔍 Creating owner profile for owner ID:', result.insertId);
        console.log('🔍 Business name from form:', businessName);
        console.log('🔍 Business email from form:', businessEmail);
        console.log('🔍 Business phone from form:', businessPhone);
        console.log('🔍 License number from form:', licenseNumber);
        console.log('🔍 User creation result:', result);
        
        // Get the actual user_id from the result
        const userId = result.insertId || result[0]?.user_id || result.user_id;
        console.log('🔍 Extracted user ID:', userId);
        
        if (!userId) {
          console.error('❌ Could not extract user ID from result:', result);
          throw new Error('Failed to get user ID from user creation');
        }
        
        const profileResult = await executeQuery(`
          INSERT INTO ownerprofiles (owner_id, business_name, license_number, id_document_url, approval_status)
          VALUES (?, ?, ?, ?, 'Pending')
        `, [
          userId, // owner_id
          businessName || `${fullName}'s Business`, // business_name
          licenseNumber || null, // license_number
          documentUrl || null, // id_document_url (uploaded document URL)
        ]);
        
        console.log('✅ Owner profile created with ID:', profileResult.insertId);
        console.log('✅ Business name stored:', businessName || `${fullName}'s Business`);
      } catch (profileError) {
        console.error('❌ Error creating owner profile:', profileError);
        console.error('❌ Profile error details:', profileError.message);
        // Continue with user creation even if profile fails
      }
    }

    // Note: Pensions are no longer created during registration
    // Owners will add properties after their business is approved

    // Auto-login for pension owners (role = 'owner')
    if (role === 'owner' || role === 'admin') {
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
        message: role === 'owner' ? 'Pension owner registered successfully. Awaiting admin approval.' : 'Admin registered successfully',
        data: {
          user: {
            id: newUser[0].user_id,
            email: newUser[0].email,
            full_name: newUser[0].full_name,
            phone: newUser[0].phone,
            role: newUser[0].role,
            approved: newUser[0].approved,
            created_at: newUser[0].created_at
          },
          token
        }
      });
    } else {
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: newUser[0].user_id,
            email: newUser[0].email,
            full_name: newUser[0].full_name,
            phone: newUser[0].phone,
            role: newUser[0].role,
            approved: newUser[0].approved,
            created_at: newUser[0].created_at
          }
        }
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
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
      'SELECT user_id, email, password_hash, full_name, phone, role, approved FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const user = users[0];

    // Debug logging
    console.log('🔍 Login attempt:', { email, role: user.role, approved: user.approved });
    console.log('🔍 Approval check:', {
      isAdmin: user.role?.toLowerCase() === 'admin',
      isApproved: user.approved === 1,
      shouldPass: user.role?.toLowerCase() === 'admin' || user.approved === 1
    });

    // Check if user is approved (except admins)
    if (user.role?.toLowerCase() !== 'admin' && user.approved !== 1) {
      console.log('❌ Login rejected: Not approved');
      return res.status(401).json({
        success: false,
        message: 'Account is not approved. Please wait for admin approval.',
        requiresApproval: true
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
        role: user.role
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
          role: user.role,
          approved: user.approved,
          created_at: user.created_at
        },
        token
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
      'SELECT user_id, full_name, email, phone, role, approved, created_at FROM users WHERE user_id = ?',
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
