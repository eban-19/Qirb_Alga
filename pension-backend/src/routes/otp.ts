import express from 'express';
import { OTPService } from '../services/otp.service';
import { validatePhone, validateOtpCode, validateEmail } from '../utils/validation';

const router = express.Router();

// Send OTP to phone number or email
router.post('/send', async (req, res) => {
  const { phone, email, name, identifier } = req.body;

  if (email || (!phone && identifier && identifier.includes('@'))) {
    const targetEmail = (email || identifier).trim().toLowerCase();
    const emailErr = validateEmail(targetEmail, true, 'Email address');
    if (emailErr) {
      return res.status(400).json({ success: false, message: emailErr });
    }

    try {
      await OTPService.sendEmailOTP(targetEmail, name);
      return res.json({ success: true, message: 'OTP sent successfully to your email' });
    } catch (error: any) {
      console.error('Email OTP Send Error:', error);
      return res.status(500).json({ success: false, message: error.message || 'Failed to send OTP to email' });
    }
  }

  const targetPhone = phone || identifier;
  const phoneErr = validatePhone(targetPhone, true, false, 'Phone number');
  if (phoneErr) {
    return res.status(400).json({ success: false, message: phoneErr });
  }

  try {
    await OTPService.sendOTP(targetPhone);
    res.json({ success: true, message: 'OTP sent successfully via SMS' });
  } catch (error: any) {
    console.error('OTP Send Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to send OTP' });
  }
});

// Verify OTP
router.post('/verify', async (req, res) => {
  const { phone, email, identifier } = req.body;
  const code = req.body.code || req.body.otp;

  const codeErr = validateOtpCode(code);
  if (codeErr) {
    return res.status(400).json({ success: false, message: codeErr });
  }

  if (email || (!phone && identifier && identifier.includes('@'))) {
    const targetEmail = (email || identifier).trim().toLowerCase();
    const emailErr = validateEmail(targetEmail, true, 'Email address');
    if (emailErr) {
      return res.status(400).json({ success: false, message: emailErr });
    }

    try {
      const isVerified = await OTPService.verifyEmailOTP(targetEmail, code, false);
      if (isVerified) {
        return res.json({ success: true, message: 'Email verified successfully' });
      } else {
        return res.status(400).json({ success: false, message: 'Invalid or expired OTP code' });
      }
    } catch (error: any) {
      console.error('Email OTP Verify Error:', error);
      return res.status(400).json({ success: false, message: error.message || 'Verification failed' });
    }
  }

  const targetPhone = phone || identifier;
  const phoneErr = validatePhone(targetPhone, true, false, 'Phone number');
  if (phoneErr) {
    return res.status(400).json({ success: false, message: phoneErr });
  }

  try {
    const isVerified = await OTPService.verifyOTP(targetPhone, code, false);
    if (isVerified) {
      res.json({ success: true, message: 'Phone verified successfully' });
    } else {
      res.status(400).json({ success: false, message: 'Invalid or expired OTP code' });
    }
  } catch (error: any) {
    console.error('OTP Verify Error:', error);
    res.status(400).json({ success: false, message: error.message || 'Verification failed' });
  }
});

export default router;
