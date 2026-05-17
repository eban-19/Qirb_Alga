import * as express from 'express';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { authenticateToken } from '../middleware/auth';
import { Role, UserStatus, ApprovalStatus } from '@prisma/client';

const router = express.Router();

// Register new user
router.post('/register', async (req: any, res: any) => {
  try {
    const { 
      email, 
      password, 
      fullName, 
      phone, 
      role = 'Owner',
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
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { user_id: true }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Map role string to enum
    let userRole: Role = Role.Owner;
    if (role.toLowerCase() === 'admin') userRole = Role.Admin;
    if (role.toLowerCase() === 'customer') userRole = Role.Customer;

    // Create user with pending approval status and optional owner profile/pension in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const newUser = await tx.user.create({
        data: {
          full_name: fullName,
          email,
          phone,
          password_hash: hashedPassword,
          role: userRole,
          status: UserStatus.Pending,
          approved: 0
        }
      });

      // Create owner profile for business owners
      if ((userRole === Role.Owner) && businessName) {
        await tx.ownerProfile.create({
          data: {
            owner_id: newUser.user_id,
            business_name: businessName || '',
            business_email: businessEmail || email || '',
            business_phone: businessPhone || phone || '',
            license_number: licenseNumber || '',
            id_document_url: documentUrl || '',
            approval_status: ApprovalStatus.Pending
          }
        });
      }

      // Create pension if data provided
      if (pensionData && (userRole === Role.Owner)) {
        await tx.pension.create({
          data: {
            name: pensionData.name,
            address: pensionData.address,
            description: pensionData.description,
            phone: pensionData.phone,
            email: pensionData.email,
            capacity: parseInt(pensionData.capacity) || 0,
            owner_id: newUser.user_id,
            status: 'pending' as any // Using literal because of enum/string mapping
          }
        });
      }

      return newUser;
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please wait for admin approval.',
      data: {
        user: {
          user_id: result.user_id,
          full_name: result.full_name,
          email: result.email,
          phone: result.phone,
          role: result.role,
          approved: result.approved,
          created_at: result.created_at
        },
        userId: result.user_id,
        email,
        fullName,
        role: result.role,
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
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Debug logging
    console.log('🔍 Login attempt:', { email, role: user.role, approved: user.approved });

    // Check if user is approved (except admins)
    if (user.role !== Role.Admin && user.approved !== 1) {
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

    const user = await prisma.user.findUnique({
      where: { user_id: userId },
      include: {
        ownerProfile: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
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
        ownerProfile: user.ownerProfile
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
  try {
    const userId = req.user.userId;
    const { 
      fullName, full_name,
      phone, 
      businessName, business_name,
      businessEmail, business_email,
      businessPhone, business_phone,
      licenseNumber, license_number,
      licenseDocument, license_document, id_document_url
    } = req.body;

    const finalFullName = fullName || full_name;
    const finalPhone = phone;
    const finalBusinessName = businessName || business_name;
    const finalBusinessEmail = businessEmail || business_email;
    const finalBusinessPhone = businessPhone || business_phone;
    const finalLicenseNumber = licenseNumber || license_number;
    const finalLicenseDocument = licenseDocument || license_document || id_document_url;

    const result = await prisma.$transaction(async (tx) => {
      // Update basic user profile
      if (finalFullName || finalPhone) {
        await tx.user.update({
          where: { user_id: userId },
          data: {
            full_name: finalFullName || undefined,
            phone: finalPhone || undefined
          }
        });
      }

      let statusChanged = false;
      if (req.user.role.toLowerCase() === 'owner') {
        const existingProfile = await tx.ownerProfile.findUnique({
          where: { owner_id: userId }
        });

        if (existingProfile) {
          // Check for critical changes
          if (
            (finalBusinessName && finalBusinessName !== existingProfile.business_name) ||
            (finalBusinessEmail && finalBusinessEmail !== existingProfile.business_email) ||
            (finalBusinessPhone && finalBusinessPhone !== existingProfile.business_phone) ||
            (finalLicenseNumber && finalLicenseNumber !== existingProfile.license_number) ||
            (finalLicenseDocument && finalLicenseDocument !== existingProfile.id_document_url)
          ) {
            statusChanged = true;
            await tx.user.update({
              where: { user_id: userId },
              data: { approved: 0 }
            });
          }

          await tx.ownerProfile.update({
            where: { owner_id: userId },
            data: {
              business_name: finalBusinessName || undefined,
              business_email: finalBusinessEmail || undefined,
              business_phone: finalBusinessPhone || undefined,
              license_number: finalLicenseNumber || undefined,
              id_document_url: finalLicenseDocument || undefined,
              approval_status: statusChanged ? ApprovalStatus.Pending : undefined
            }
          });
        } else if (finalBusinessName || finalBusinessEmail || finalBusinessPhone || finalLicenseNumber || finalLicenseDocument) {
          await tx.ownerProfile.create({
            data: {
              owner_id: userId,
              business_name: finalBusinessName || '',
              business_email: finalBusinessEmail || '',
              business_phone: finalBusinessPhone || '',
              license_number: finalLicenseNumber || '',
              id_document_url: finalLicenseDocument || '',
              approval_status: ApprovalStatus.Pending
            }
          });
          statusChanged = true;
        }
      }
      return { statusChanged };
    });

    res.json({
      success: true,
      message: 'Profile updated successfully' + (result.statusChanged ? ' and is pending admin review' : ''),
      statusChanged: result.statusChanged
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

    const user = await prisma.user.findUnique({
      where: { user_id: userId },
      select: { password_hash: true }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { user_id: userId },
      data: { password_hash: hashedNewPassword }
    });

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
