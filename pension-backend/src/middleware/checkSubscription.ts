import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

export const checkSubscription = async (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  
  if (!user || user.role !== 'Owner') {
    return next();
  }

  try {
    const userId = parseInt(user.userId || user.user_id || user.id);
    console.log(`🔍 Checking subscription for User ID: ${userId}`);
    
    if (!userId || isNaN(userId)) {
      console.error('❌ Invalid or missing User ID in token:', user);
      return next(); // Fail safe: allow if token structure is unexpected
    }

    const owner = await prisma.user.findUnique({
      where: { user_id: userId },
      include: {
        subscriptions: {
          where: { status: 'ACTIVE' },
          orderBy: { end_date: 'desc' },
          take: 1
        }
      }
    });

    if (!owner) {
      console.warn(`⚠️ Owner ${userId} not found in database during subscription check`);
      return next(); // Fail safe: allow if owner record is missing
    }

    console.log(`✅ Owner found: ${owner.full_name}, Created at: ${owner.created_at}`);

    // Handle potential null created_at
    const registrationDate = owner.created_at || new Date();
    const trialDays = 14;
    const trialExpiry = new Date(registrationDate.getTime() + trialDays * 24 * 60 * 60 * 1000);
    const isTrialActive = new Date() < trialExpiry;
    
    const activeSub = owner.subscriptions[0];
    const isSubActive = activeSub && new Date() < activeSub.end_date;

    console.log(`📊 Trial active: ${isTrialActive}, Subscription active: ${isSubActive}`);

    if (!isTrialActive && !isSubActive) {
      return res.status(403).json({
        success: false,
        message: 'Your trial/subscription has expired. Please subscribe to continue using this feature.',
        requiresSubscription: true
      });
    }

    next();
  } catch (error: any) {
    console.error('❌ Subscription Check Error:', error);
    // FAIL SAFE: In development, allow the action even if subscription check fails
    // This prevents blocking the user while we debug database issues
    next(); 
  }
};
