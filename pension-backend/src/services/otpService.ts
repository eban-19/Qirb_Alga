import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

export const generateOTP = () => {
  return "123456"; // Hardcoded for demo/testing. Use crypto.randomInt for production.
};

export const sendOTP = async (phone: string, code: string) => {
  // In a real production app, integrate with an SMS gateway like Twilio, Africa's Talking, or a local Ethiopian provider.
  console.log(`[SMS MOCK] Sending OTP ${code} to ${phone}`);
  
  // Example for future integration:
  // await smsProvider.send({ to: phone, message: `Your PensionHub verification code is: ${code}` });
  
  return true;
};

export const createVerification = async (phone: string) => {
  const code = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

  await prisma.phoneVerification.create({
    data: {
      phone,
      code,
      expires_at: expiresAt,
    },
  });

  await sendOTP(phone, code);
  return { success: true, message: 'OTP sent successfully' };
};

export const verifyOTP = async (phone: string, code: string) => {
  const verification = await prisma.phoneVerification.findFirst({
    where: {
      phone,
      code,
      is_verified: false,
      expires_at: {
        gt: new Date(),
      },
    },
    orderBy: {
      created_at: 'desc',
    },
  });

  if (!verification) {
    throw new Error('Invalid or expired OTP');
  }

  await prisma.phoneVerification.update({
    where: { verification_id: verification.verification_id },
    data: { is_verified: true },
  });

  return { success: true, message: 'Phone verified successfully' };
};
