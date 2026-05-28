import * as jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { Response, NextFunction } from 'express';
import { Role, UserStatus, SubscriptionStatus } from '@prisma/client';

// Middleware to authenticate JWT token
const authenticateToken = (req: any, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err: any, user: any) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    req.user = user;
    next();
  });
};

// Middleware to check if owner is approved
const requireOwnerApproval = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.userId;
    
    // Check if user is admin (admins bypass approval)
    if (req.user.role === 'admin' || req.user.role === Role.Admin) {
      return next();
    }

    // Check owner approval status
    const user = await prisma.user.findUnique({
      where: { user_id: userId }
    });

    if (!user) {
      return res.status(403).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role !== Role.Owner && req.user.role !== 'owner') {
      return next(); // Not an owner, move on
    }

    // Check for approval (status enum or legacy approved flag)
    const isApproved = user.status === UserStatus.Approved || user.approved === 1;

    if (!isApproved) {
      return res.status(403).json({
        success: false,
        message: 'Owner account not approved',
        requiresApproval: true
      });
    }

    next();
  } catch (error: any) {
    console.error('Approval check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error checking approval status'
    });
  }
};

// Middleware to check if user has active subscription
const requireSubscription = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.userId;

    // Admin bypass
    if (req.user.role === 'admin' || req.user.role === Role.Admin) {
      return next();
    }

    // Only owners need subscriptions
    if (req.user.role !== Role.Owner && req.user.role !== 'owner') {
      return next();
    }

    // Use SubscriptionEnforcementService instead of hardcoded rules
    const subscriptionEnforcementService = require('../services/subscriptionEnforcementService').default;
    
    // For general middleware protection, we check a generic 'dashboard_access' feature
    // In the future, specific routes could check specific features
    const hasAccess = await subscriptionEnforcementService.checkFeatureAccess(userId, 'dashboard_access');

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Active subscription, trial, or grace period required to access this feature',
        requiresSubscription: true
      });
    }

    next();
  } catch (error: any) {
    console.error('Subscription check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error checking subscription status'
    });
  }
};

// Middleware to check user role
const requireRole = (roles: string[]) => {
  return (req: any, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Case-insensitive role check
    const userRole = req.user.role?.toLowerCase();
    const authorizedRoles = roles.map(role => role.toLowerCase());

    if (!authorizedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

// Middleware to check if user is admin
const requireAdmin = requireRole(['admin']);

export {
  authenticateToken,
  requireRole,
  requireAdmin,
  requireOwnerApproval,
  requireSubscription
};
