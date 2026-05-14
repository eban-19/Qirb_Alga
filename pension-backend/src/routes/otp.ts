import express from 'express';
import { OTPService } from '../services/otp.service';

const router = express.Router();

// Send OTP to phone number
router.post('/send', async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ success: false, message: 'Phone number is required' });
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

  if (!phone || !code) {
    return res.status(400).json({ success: false, message: 'Phone and code are required' });
  }

  try {
    const isVerified = await OTPService.verifyOTP(phone, code);
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
