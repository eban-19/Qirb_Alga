import * as express from 'express';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { authenticateToken } from '../middleware/auth';
import { Role, UserStatus, ApprovalStatus } from '@prisma/client';
import { OTPService } from '../services/otp.service';
import {
  validateName,
  validateEmail,
  validatePhone,
  validatePassword,
  validateOtpCode
} from '../utils/validation';

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

    // Validate inputs
    const errors: Record<string, string> = {};

    const nameErr = validateName(fullName, 'Full Name', true);
    if (nameErr) errors.fullName = nameErr;

    const emailErr = validateEmail(email, true, 'Email address');
    if (emailErr) errors.email = emailErr;

    const phoneErr = validatePhone(phone, true, false, 'Phone number');
    if (phoneErr) errors.phone = phoneErr;

    const passErr = validatePassword(password, true, 'Password');
    if (passErr) errors.password = passErr;

    if (businessEmail) {
      const bEmailErr = validateEmail(businessEmail, false, 'Business email');
      if (bEmailErr) errors.businessEmail = bEmailErr;
    }

    if (businessPhone) {
      const bPhoneErr = validatePhone(businessPhone, false, false, 'Business phone');
      if (bPhoneErr) errors.businessPhone = bPhoneErr;
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: Object.values(errors)[0],
        errors
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
          status: userRole === Role.Customer ? UserStatus.Approved : UserStatus.Pending,
          approved: userRole === Role.Customer ? 1 : 0
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
    if (!user.password_hash) {
      return res.status(401).json({
        success: false,
        message: 'This account does not have a password set. Please login via OTP.'
      });
    }
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

// Check if user exists (to determine if we should show login or register)
router.get('/check-user', async (req: any, res: any) => {
  try {
    const { identifier } = req.query;
    if (!identifier) return res.status(400).json({ success: false });

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { phone: identifier }
        ]
      }
    });

    res.json({
      success: true,
      exists: !!user,
      role: user?.role
    });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

// OTP Login/Register for Customers
router.post('/otp-login', async (req: any, res: any) => {
  try {
    const { phone, code, fullName } = req.body;

    const errors: Record<string, string> = {};
    const phoneErr = validatePhone(phone, true, false, 'Phone number');
    if (phoneErr) errors.phone = phoneErr;

    const codeErr = validateOtpCode(code);
    if (codeErr) errors.code = codeErr;

    if (fullName) {
      const nameErr = validateName(fullName, 'Full Name', false);
      if (nameErr) errors.fullName = nameErr;
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: Object.values(errors)[0],
        errors
      });
    }

    // 1. Verify OTP
    const isVerified = await OTPService.verifyOTP(phone, code);
    if (!isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP code'
      });
    }

    // 2. Normalize phone
    const cleanPhone = phone.replace(/\D/g, '');
    const normalizedPhone = cleanPhone.startsWith('0') ? '+251' + cleanPhone.substring(1) : (cleanPhone.startsWith('251') ? '+' + cleanPhone : '+251' + cleanPhone);

    // 3. Find or Create user
    let user = await prisma.user.findFirst({
      where: { 
        OR: [
          { phone: normalizedPhone },
          { phone: phone }
        ]
      }
    });

    if (!user) {
      // Create new customer
      user = await prisma.user.create({
        data: {
          phone: normalizedPhone,
          full_name: fullName || 'Guest Customer',
          role: Role.Customer,
          status: UserStatus.Approved, // Auto-approve phone-verified customers
          approved: 1,
          email_verified: 0
        }
      });
    } else {
        // If user exists but was pending, approve them since they verified phone
        if (user.role === Role.Customer && user.approved === 0) {
            user = await prisma.user.update({
                where: { user_id: user.user_id },
                data: { approved: 1, status: UserStatus.Approved }
            });
        }
    }

    // 4. Generate JWT
    const token = jwt.sign(
      { 
        userId: user.user_id, 
        email: user.email, 
        role: user.role,
        fullName: user.full_name 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '30d' } // Longer session for customers
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
    console.error('OTP Login error:', error);
    res.status(500).json({
      success: false,
      message: 'OTP Login failed',
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

    const errors: Record<string, string> = {};
    if (finalFullName) {
      const nameErr = validateName(finalFullName, 'Full Name', false);
      if (nameErr) errors.fullName = nameErr;
    }
    if (finalPhone) {
      const phoneErr = validatePhone(finalPhone, false, false, 'Phone number');
      if (phoneErr) errors.phone = phoneErr;
    }
    if (finalBusinessEmail) {
      const bEmailErr = validateEmail(finalBusinessEmail, false, 'Business email');
      if (bEmailErr) errors.businessEmail = bEmailErr;
    }
    if (finalBusinessPhone) {
      const bPhoneErr = validatePhone(finalBusinessPhone, false, false, 'Business phone');
      if (bPhoneErr) errors.businessPhone = bPhoneErr;
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: Object.values(errors)[0],
        errors
      });
    }

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

    if (!currentPassword) {
      return res.status(400).json({ success: false, message: 'Current password is required' });
    }

    const passErr = validatePassword(newPassword, true, 'New password');
    if (passErr) {
      return res.status(400).json({ success: false, message: passErr });
    }

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

    if (!user.password_hash) {
      return res.status(400).json({
        success: false,
        message: 'Current password is not set for this account'
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
