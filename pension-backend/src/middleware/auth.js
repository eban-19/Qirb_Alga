const jwt = require('jsonwebtoken');
const { executeQuery } = require('../config/database');

// Middleware to authenticate JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
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
const requireOwnerApproval = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    
    // Check if user is admin (admins bypass approval)
    if (req.user.role === 'admin') {
      return next();
    }

    // Check owner approval status
    const ownerQuery = await executeQuery(
      'SELECT approved FROM users WHERE id = ? AND role = "owner"',
      [userId]
    );

    if (ownerQuery.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Owner not found'
      });
    }

    const owner = ownerQuery[0];
    if (owner.approved !== 1) {
      return res.status(403).json({
        success: false,
        message: 'Owner account not approved',
        requiresApproval: true
      });
    }

    next();
  } catch (error) {
    console.error('Approval check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error checking approval status'
    });
  }
};

// Middleware to check user role
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Case-insensitive role check
    if (!roles.map(role => role.toLowerCase()).includes(req.user.role?.toLowerCase())) {
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

module.exports = {
  authenticateToken,
  requireRole,
  requireAdmin,
  requireOwnerApproval
};
