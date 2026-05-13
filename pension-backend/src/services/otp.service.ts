import { PrismaClient } from '@prisma/client';
import { SMSService } from './sms.service';

const prisma = new PrismaClient();

export class OTPService {
  /**
   * Normalize phone number to +251 format
   */
  private static normalizePhone(phone: string): string {
    let clean = phone.replace(/\D/g, ''); // Remove all non-digits
    
    if (clean.startsWith('09')) {
      return '+251' + clean.substring(1);
    }
    if (clean.startsWith('9')) {
      return '+251' + clean;
    }
    if (clean.startsWith('251')) {
      return '+' + clean;
    }
    if (!clean.startsWith('+')) {
      return '+' + clean;
    }
    return clean;
  }

  /**
   * Generate a 6-digit OTP and send it via SMS
   * @param phone Phone number
   */
  static async sendOTP(phone: string): Promise<boolean> {
    try {
      console.log(`[OTP] Request for phone: ${phone}`);
      const normalizedPhone = this.normalizePhone(phone);
      console.log(`[OTP] Normalized phone: ${normalizedPhone}`);

      // 1. Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      console.log(`[OTP] Generated Code: ${otp} (Expires in 5m)`);
      
      // 2. Set expiration (5 minutes from now)
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 5);

      // 3. Save to database
      await prisma.phoneVerification.create({
        data: {
          phone: normalizedPhone,
          code: otp,
          expires_at: expiresAt,
          is_verified: false
        }
      });

      // 4. Send via SMS
      const message = `Your Qirb Alga verification code is: ${otp}. Valid for 5 minutes.`;
      const result = await SMSService.sendSMS(normalizedPhone, message);
      console.log(`[OTP] Africa's Talking Response:`, JSON.stringify(result, null, 2));

      return true;
    } catch (error: any) {
      console.error('❌ OTP Service Error (sendOTP):', error.message);
      throw error;
    }
  }

  /**
   * Verify an OTP code for a specific phone number
   * @param phone Phone number
   * @param code 6-digit code
   */
  static async verifyOTP(phone: string, code: string): Promise<boolean> {
    try {
      const normalizedPhone = this.normalizePhone(phone);
      
      const verification = await prisma.phoneVerification.findFirst({
        where: {
          phone: normalizedPhone,
          code,
          is_verified: false,
          expires_at: {
            gt: new Date()
          }
        },
        orderBy: {
          created_at: 'desc'
        }
      });

      if (!verification) {
        return false;
      }

      // Mark as verified
      await prisma.phoneVerification.update({
        where: { verification_id: verification.verification_id },
        data: { is_verified: true }
      });

      return true;
    } catch (error: any) {
      console.error('❌ OTP Service Error (verifyOTP):', error.message);
      throw error;
    }
  }
}
