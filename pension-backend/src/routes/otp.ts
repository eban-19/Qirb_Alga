import express from 'express';
import { OTPService } from '../services/otp.service';
import { validatePhone, validateOtpCode } from '../utils/validation';

const router = express.Router();

// Send OTP to phone number
router.post('/send', async (req, res) => {
  const { phone } = req.body;

  const phoneErr = validatePhone(phone, true, false, 'Phone number');
  if (phoneErr) {
    return res.status(400).json({ success: false, message: phoneErr });
  }

  try {
    await OTPService.sendOTP(phone);
    res.json({ success: true, message: 'OTP sent successfully via SMS' });
  } catch (error: any) {
    console.error('OTP Send Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to send OTP' });
  }
});

// Verify OTP
router.post('/verify', async (req, res) => {
  const { phone, code } = req.body;

  const phoneErr = validatePhone(phone, true, false, 'Phone number');
  if (phoneErr) {
    return res.status(400).json({ success: false, message: phoneErr });
  }

  const codeErr = validateOtpCode(code);
  if (codeErr) {
    return res.status(400).json({ success: false, message: codeErr });
  }

  try {
    const isVerified = await OTPService.verifyOTP(phone, code, false);
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
