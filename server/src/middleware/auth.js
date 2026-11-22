const jwt = require('jsonwebtoken');
const prisma = require('../config/database');
const { AppError } = require('./errorHandler');

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'swarada_saree_access_secret_super_secure_key_2026';

/**
 * Authenticate incoming request via HTTP-only cookie or Bearer header
 */
const authenticate = async (req, res, next) => {
  try {
    let token = null;

    // 1. Check HTTP-only cookie first
    if (req.cookies && req.cookies.access_token) {
      token = req.cookies.access_token;
    }
    // 2. Check Authorization header fallback
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('You are not logged in. Please sign in to continue.', 401));
    }

    // 3. Verify JWT
    const decoded = jwt.verify(token, JWT_ACCESS_SECRET);

    // 4. Check if user still exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        profile: {
          select: {
            firstName: true,
            lastName: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!user || !user.isActive) {
      return next(new AppError('The user belonging to this session is inactive or no longer exists.', 401));
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Your session has expired. Please log in again.', 401));
    }
    return next(new AppError('Invalid or corrupted session token. Please log in again.', 401));
  }
};

/**
 * Optional authentication - extracts user if token exists, but doesn't block request
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token = null;

    if (req.cookies && req.cookies.access_token) {
      token = req.cookies.access_token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, JWT_ACCESS_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    req.user = user && user.isActive ? user : null;
    next();
  } catch {
    req.user = null;
    next();
  }
};

/**
 * Restrict access to specific roles
 * @param  {...string} roles
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action.', 403));
    }
    next();
  };
};

module.exports = {
  authenticate,
  optionalAuth,
  requireRole,
};
