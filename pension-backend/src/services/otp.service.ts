import { PrismaClient } from '@prisma/client';
import { SMSService } from './sms.service';
import { sendBookingVerificationEmail } from './emailService';

const prisma = new PrismaClient();

// In-memory fallback/cache for email OTP verification
interface EmailOtpRecord {
  email: string;
  code: string;
  expiresAt: Date;
  isVerified: boolean;
}
const emailOtpStore = new Map<string, EmailOtpRecord>();

export class OTPService {
  /**
   * Normalize phone number to +251 format
   */
  public static normalizePhone(phone: string): string {
    if (!phone) return phone;
    let clean = phone.replace(/\D/g, ''); // Remove all non-digits

    if (clean.startsWith('09') || clean.startsWith('07')) {
      return '+251' + clean.substring(1);
    }
    if (clean.startsWith('9') || clean.startsWith('7')) {
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
  static async verifyOTP(phone: string, code: string, markVerified: boolean = true): Promise<boolean> {
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

      if (markVerified) {
        // Mark as verified
        await prisma.phoneVerification.update({
          where: { verification_id: verification.verification_id },
          data: { is_verified: true }
        });
      }

      return true;
    } catch (error: any) {
      console.error('❌ OTP Service Error (verifyOTP):', error.message);
      throw error;
    }
  }

  /**
   * Generate a 6-digit OTP and send it via Email
   * @param email Email address
   * @param name Optional guest name
   */
  static async sendEmailOTP(email: string, name?: string): Promise<boolean> {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      console.log(`[OTP] Request for email: ${normalizedEmail}`);

      // 1. Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      console.log(`[EMAIL OTP] Generated Code: ${otp} (Expires in 10m)`);

      // 2. Set expiration (10 minutes from now)
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10);

      // 3. Store in memory store
      emailOtpStore.set(normalizedEmail, {
        email: normalizedEmail,
        code: otp,
        expiresAt,
        isVerified: false
      });

      // 4. Also persist to database if table available
      try {
        await prisma.passwordResetToken.create({
          data: {
            email: normalizedEmail,
            code: otp,
            token: `EMAIL_VERIFY_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
            expires_at: expiresAt,
            is_used: false
          }
        });
      } catch (dbErr: any) {
        console.warn('[OTP] Could not persist email verification to DB (falling back to in-memory):', dbErr?.message);
      }

      // 5. Send via Email
      await sendBookingVerificationEmail({
        to: normalizedEmail,
        name: name || 'Valued Guest',
        code: otp
      });

      return true;
    } catch (error: any) {
      console.error('❌ OTP Service Error (sendEmailOTP):', error.message);
      throw error;
    }
  }

  /**
   * Verify an OTP code for a specific email address
   * @param email Email address
   * @param code 6-digit code
   */
  static async verifyEmailOTP(email: string, code: string, markVerified: boolean = true): Promise<boolean> {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const cleanCode = code.trim();

      // 1. Check in-memory store
      const memRecord = emailOtpStore.get(normalizedEmail);
      if (memRecord && memRecord.code === cleanCode && memRecord.expiresAt > new Date()) {
        if (markVerified) {
          memRecord.isVerified = true;
        }
        try {
          await prisma.passwordResetToken.updateMany({
            where: {
              email: normalizedEmail,
              code: cleanCode,
              is_used: false
            },
            data: { is_used: true }
          });
        } catch (e) { }
        return true;
      }

      // 2. Check database (optional persistence fallback)
      try {
        const dbRecord = await prisma.passwordResetToken.findFirst({
          where: {
            email: normalizedEmail,
            code: cleanCode,
            is_used: false,
            expires_at: { gt: new Date() }
          },
          orderBy: { created_at: 'desc' }
        });

        if (dbRecord) {
          if (markVerified) {
            await prisma.passwordResetToken.update({
              where: { token_id: dbRecord.token_id },
              data: { is_used: true }
            });
          }
          return true;
        }
      } catch (dbErr: any) {
        // Fallback: table may not exist in database, in-memory was already checked
      }

      return false;
    } catch (error: any) {
      console.error('❌ OTP Service Error (verifyEmailOTP):', error.message);
      throw error;
    }
  }
}

