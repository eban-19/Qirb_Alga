import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';
import { ApiResponse, JWTPayload, AuthRequest, User } from '../types/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Generate JWT token
export const generateToken = (payload: Omit<JWTPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
};

// Verify JWT token
export const verifyToken = (token: string): JWTPayload => {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
};

// Hash password
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

// Compare password
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

// Authentication middleware
export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({
      success: false,
      error: 'Access token required',
      timestamp: new Date().toISOString()
    } as ApiResponse);
    return;
  }

  try {
    const decoded = verifyToken(token);
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };
    next();
  } catch (error) {
    res.status(403).json({
      success: false,
      error: 'Invalid or expired token',
      timestamp: new Date().toISOString()
    } as ApiResponse);
  }
};

// Role-based access control middleware
export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
        timestamp: new Date().toISOString()
      } as ApiResponse);
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        timestamp: new Date().toISOString()
      } as ApiResponse);
      return;
    }

    next();
  };
};

// Owner access middleware (user can only access their own pensions)
export const requirePensionOwner = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Authentication required',
      timestamp: new Date().toISOString()
    } as ApiResponse);
    return;
  }

  // Admin and super admin can access all pensions
  if (['admin', 'super_admin'].includes(req.user.role)) {
    next();
    return;
  }

  // Owners and managers can only access their own pensions
  // This will be implemented when we check pension ownership in the route handlers
  next();
};

// Error handling middleware for authentication
export const authErrorHandler = (error: Error, req: Request, res: Response, next: NextFunction): void => {
  if (error.name === 'JsonWebTokenError') {
    res.status(403).json({
      success: false,
      error: 'Invalid token',
      timestamp: new Date().toISOString()
    } as ApiResponse);
    return;
  }

  if (error.name === 'TokenExpiredError') {
    res.status(403).json({
      success: false,
      error: 'Token expired',
      timestamp: new Date().toISOString()
    } as ApiResponse);
    return;
  }

  next(error);
};

// Helper function to extract user from request
export const getUserFromRequest = (req: AuthRequest): Omit<JWTPayload, 'iat' | 'exp'> | null => {
  if (!req.user) return null;
  
  return {
    userId: req.user.userId,
    email: req.user.email,
    role: req.user.role
  };
};

// Rate limiting for auth endpoints (simple in-memory implementation)
const authAttempts = new Map<string, { count: number; lastAttempt: Date }>();

export const authRateLimit = (maxAttempts: number = 5, windowMinutes: number = 15) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const key = req.ip || req.socket.remoteAddress || 'unknown';
    const now = new Date();
    const windowStart = new Date(now.getTime() - windowMinutes * 60 * 1000);

    const attempts = authAttempts.get(key);

    if (!attempts || attempts.lastAttempt < windowStart) {
      authAttempts.set(key, { count: 1, lastAttempt: now });
      next();
      return;
    }

    if (attempts.count >= maxAttempts) {
      res.status(429).json({
        success: false,
        error: 'Too many authentication attempts. Please try again later.',
        timestamp: new Date().toISOString()
      } as ApiResponse);
      return;
    }

    attempts.count++;
    attempts.lastAttempt = now;
    next();
  };
};

// Clean up old rate limit entries periodically
setInterval(() => {
  const now = new Date();
  const windowStart = new Date(now.getTime() - 15 * 60 * 1000); // 15 minutes

  for (const [key, attempts] of authAttempts.entries()) {
    if (attempts.lastAttempt < windowStart) {
      authAttempts.delete(key);
    }
  }
}, 5 * 60 * 1000); // Clean up every 5 minutes