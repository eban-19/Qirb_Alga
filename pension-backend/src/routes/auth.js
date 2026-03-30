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
      documentUrl,
      pensionData
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

    // Create owner profile for business owners
    if ((role === 'owner' || role === 'Owner') && businessName) {
      try {
        console.log('🔍 Creating owner profile for user ID:', result.insertId, 'with business data:', {
          businessName,
          businessEmail,
          businessPhone,
          licenseNumber,
          documentUrl
        });
        
        const ownerProfileResult = await executeQuery(`
          INSERT INTO ownerprofiles (owner_id, business_name, business_email, business_phone, license_number, id_document_url, approval_status, created_at)
          VALUES (?, ?, ?, ?, ?, ?, 'Pending', NOW())
        `, [
          result.insertId, // owner_id
          businessName || '', // business_name
          businessEmail || email || '', // business_email
          businessPhone || phone || '', // business_phone
          licenseNumber || '', // license_number
          documentUrl || '' // id_document_url
        ]);
        
        console.log('✅ Owner profile created with ID:', ownerProfileResult.insertId);
        
        // Verify the owner profile was created
        const verifyProfile = await executeQuery(
          'SELECT * FROM ownerprofiles WHERE owner_id = ?',
          [result.insertId]
        );
        console.log('🔍 Verification - found owner profile:', verifyProfile);
        
      } catch (profileError) {
        console.error('❌ Failed to create owner profile:', profileError);
        console.error('❌ Error details:', profileError.message);
        // Don't fail registration if profile creation fails
      }
    }

    // Create a pension for new owners using the actual form data
    if ((role === 'owner' || role === 'Owner') && pensionData) {
      try {
        console.log('🔍 Creating pension for owner ID:', result.insertId, 'with data:', pensionData);
        
        const pensionResult = await executeQuery(`
          INSERT INTO pensions (owner_id, name, phone, email, description, city, capacity, status, address)
          VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?)
        `, [
          result.insertId, // owner_id
          pensionData.name || `${fullName}'s Pension`, // name
          pensionData.phone || phone || '', // phone
          pensionData.email || email || '', // email
          pensionData.description || `Professional hospitality service`, // description
          pensionData.address || 'Addis Ababa', // city
          pensionData.capacity || 0, // capacity
          pensionData.address || '' // address
        ]);
        
        console.log('✅ Pension created with ID:', pensionResult.insertId);
        
        // Verify the pension was created
        const verifyPension = await executeQuery(
          'SELECT pension_id, owner_id, name FROM pensions WHERE owner_id = ?',
          [result.insertId]
        );
        console.log('🔍 Verification - found pensions:', verifyPension);
        
      } catch (pensionError) {
        console.error('❌ Failed to create pension:', pensionError);
        console.error('❌ Error details:', pensionError.message);
        // Don't fail registration if pension creation fails
      }
    }

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
