import * as express from 'express';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { executeQuery, executeTransaction } from '../config/database';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Register new user
router.post('/register', async (req: any, res: any) => {
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
        
        if (verifyProfile.length === 0) {
          console.warn('⚠️ Owner profile verification failed');
        } else {
          console.log('✅ Owner profile verified:', verifyProfile[0]);
        }
      } catch (profileError: any) {
        console.error('❌ Error creating owner profile:', profileError);
        // Don't fail the whole registration if profile creation fails
        // Just log the error and continue
      }
    }

    // Create pension if data provided
    if (pensionData && (role === 'owner' || role === 'Owner')) {
      try {
        console.log('🏠 Creating pension for user ID:', result.insertId, 'with pension data:', pensionData);
        
        const pensionResult = await executeQuery(
          `INSERT INTO pensions (name, address, description, phone, email, capacity, owner_id, status, created_at) 
           VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending', NOW())`,
          [
            pensionData.name,
            pensionData.address,
            pensionData.description,
            pensionData.phone,
            pensionData.email,
            pensionData.capacity,
            result.insertId
          ]
        );
        
        console.log('✅ Pension created with ID:', pensionResult.insertId);
      } catch (pensionError: any) {
        console.error('❌ Error creating pension:', pensionError);
        // Don't fail the whole registration if pension creation fails
        // Just log the error and continue
      }
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please wait for admin approval.',
      data: {
        user: newUser[0],
        userId: result.insertId,
        email,
        fullName,
        role,
        status: 'pending'
      }
    });

  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Login user
router.post('/login', async (req: any, res: any) => {
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
        role: user.role,
        fullName: user.full_name 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.user_id,
          email: user.email,
          full_name: user.full_name,
          phone: user.phone,
          role: user.role,
          approved: user.approved
        }
      }
    });

  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get current user profile
router.get('/profile', authenticateToken as any, async (req: any, res: any) => {
  try {
    const userId = req.user.userId;

    const users = await executeQuery(
      'SELECT user_id, email, full_name, phone, role, status, created_at FROM users WHERE user_id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = users[0];

    // Get owner profile if user is owner
    let ownerProfile = null;
    console.log('🔍 Get profile - User role:', user.role, 'User ID:', userId);
    if (user.role === 'owner') {
      const profiles = await executeQuery(
        'SELECT * FROM ownerprofiles WHERE owner_id = ?',
        [userId]
      );
      console.log('🔍 Get profile - Owner profiles query result:', profiles);
      ownerProfile = profiles.length > 0 ? profiles[0] : null;
      console.log('🔍 Get profile - Owner profile set to:', ownerProfile);
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.user_id,
          email: user.email,
          full_name: user.full_name,
          phone: user.phone,
          role: user.role,
          status: user.status,
          created_at: user.created_at
        },
        ownerProfile
      }
    });

  } catch (error: any) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
});

// Update user profile
router.put('/profile', authenticateToken as any, async (req: any, res: any) => {
  console.log('🔍 PUT /auth/profile - Request body:', req.body);
  console.log('🔍 PUT /auth/profile - User role:', req.user.role);
  console.log('🔍 PUT /auth/profile - User ID:', req.user.userId);
  
  try {
    const userId = req.user.userId;
    const { fullName, phone, businessName, businessEmail, businessPhone, licenseNumber, licenseDocument } = req.body;

    // Update basic user profile
    if (fullName || phone) {
      await executeQuery(
        'UPDATE users SET full_name = ?, phone = ? WHERE user_id = ?',
        [fullName || req.body.fullName, phone || req.body.phone, userId]
      );
    }

    // Update business profile if user is owner and business data provided
    let statusChanged = false;
    if ((businessName || businessEmail || businessPhone || licenseNumber || licenseDocument) && req.user.role.toLowerCase() === 'owner') {
      // Check if owner profile exists
      const existingProfile = await executeQuery(
        'SELECT * FROM ownerprofiles WHERE owner_id = ?',
        [userId]
      );

      // Check if any critical business fields are being changed
      const criticalFieldsChanged = [];
      if (existingProfile.length > 0) {
        const current = existingProfile[0];
        console.log('🔍 Update profile - Current profile:', current);
        console.log('🔍 Update profile - New data:', { businessName, businessEmail, businessPhone, licenseNumber, licenseDocument });
        
        if (businessName && businessName !== current.business_name) criticalFieldsChanged.push('business_name');
        if (businessEmail && businessEmail !== current.business_email) criticalFieldsChanged.push('business_email');
        if (businessPhone && businessPhone !== current.business_phone) criticalFieldsChanged.push('business_phone');
        if (licenseNumber && licenseNumber !== current.license_number) criticalFieldsChanged.push('license_number');
        if (licenseDocument && licenseDocument !== current.id_document_url) criticalFieldsChanged.push('id_document_url');
        
        console.log('🔍 Update profile - Critical fields changed:', criticalFieldsChanged);
      }

      // If critical fields changed, set status to Pending
      if (criticalFieldsChanged.length > 0) {
        statusChanged = true;
        console.log('🔍 Critical business fields changed:', criticalFieldsChanged, 'Setting status to Pending');
        
        // Also update users table to set approved = 0 (pending)
        await executeQuery(
          'UPDATE users SET approved = 0 WHERE user_id = ?',
          [userId]
        );
      }

      if (existingProfile.length > 0) {
        // Update existing owner profile - only update non-empty fields
        const updateFields = [];
        const updateParams = [];
        
        if (businessName !== undefined && businessName !== '') {
          updateFields.push('business_name = ?');
          updateParams.push(businessName);
        }
        if (businessEmail !== undefined && businessEmail !== '') {
          updateFields.push('business_email = ?');
          updateParams.push(businessEmail);
        }
        if (businessPhone !== undefined && businessPhone !== '') {
          updateFields.push('business_phone = ?');
          updateParams.push(businessPhone);
        }
        // Only update license number if explicitly provided (not empty)
        if (licenseNumber !== undefined && licenseNumber !== '') {
          updateFields.push('license_number = ?');
          updateParams.push(licenseNumber);
        }
        // Only update document if explicitly provided (not empty)
        if (licenseDocument !== undefined && licenseDocument !== '') {
          updateFields.push('id_document_url = ?');
          updateParams.push(licenseDocument);
        }
        
        updateFields.push('approval_status = ?');
        updateParams.push(statusChanged ? 'Pending' : 'Approved');
        updateParams.push(userId); // Add userId for WHERE clause
        
        const updateQuery = `UPDATE ownerprofiles SET ${updateFields.join(', ')} WHERE owner_id = ?`;
        await executeQuery(updateQuery, updateParams);
      } else {
        // Create new owner profile
        await executeQuery(`
          INSERT INTO ownerprofiles 
          SET owner_id = ?,
              business_name = ?,
              business_email = ?,
              business_phone = ?,
              license_number = ?,
              id_document_url = ?,
              expiry_date = ?,
              approval_status = ?
        `, [
          userId,
          businessName,
          businessEmail,
          businessPhone,
          licenseNumber,
          licenseDocument,
          statusChanged ? 'Pending' : 'Approved'
        ]);
      }
    }

    res.json({
      success: true,
      message: 'Profile updated successfully' + (statusChanged ? ' and is pending admin review' : ''),
      statusChanged: statusChanged
    });

  } catch (error: any) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Change password
router.put('/change-password', authenticateToken as any, async (req: any, res: any) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    // Get current user
    const users = await executeQuery(
      'SELECT password_hash FROM users WHERE user_id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, users[0].password_hash);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await executeQuery(
      'UPDATE users SET password_hash = ? WHERE user_id = ?',
      [hashedNewPassword, userId]
    );

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error: any) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
