const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'swarada_saree_access_secret_super_secure_key_2026';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'swarada_saree_refresh_secret_ultra_secure_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

/**
 * Generate Access and Refresh JWT Tokens
 */
const generateTokens = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwt.sign(payload, JWT_ACCESS_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
  });

  return { accessToken, refreshToken };
};

/**
 * Register a new customer
 */
const register = async (data) => {
  const { email, phone, password, firstName, lastName } = data;

  // 1. Check if email already registered
  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) {
    throw new AppError('An account with this email address already exists. Please log in.', 409);
  }

  // 2. Check if phone already registered (if provided)
  if (phone) {
    const existingPhone = await prisma.user.findUnique({ where: { phone } });
    if (existingPhone) {
      throw new AppError('An account with this mobile number already exists.', 409);
    }
  }

  // 3. Hash password with Argon2
  const passwordHash = await argon2.hash(password);

  // 4. Create user, customer profile, and empty cart + wishlist in single transaction
  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        email,
        phone: phone || null,
        passwordHash,
        role: 'CUSTOMER',
        profile: {
          create: {
            firstName,
            lastName,
            displayName: `${firstName} ${lastName}`,
          },
        },
        cart: {
          create: {
            sessionId: `cart_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          },
        },
        wishlist: {
          create: {},
        },
      },
      select: {
        id: true,
        email: true,
        phone: true,
        role: true,
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

    return newUser;
  });

  const tokens = generateTokens(user);
  return { user, tokens };
};

/**
 * Log in a user (Customer or Admin)
 */
const login = async (email, password) => {
  // 1. Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      profile: true,
    },
  });

  if (!user) {
    throw new AppError('Invalid email or password.', 401);
  }

  if (!user.isActive) {
    throw new AppError('Your account has been deactivated. Please contact support.', 403);
  }

  // 2. Verify password with Argon2
  const isMatch = await argon2.verify(user.passwordHash, password);
  if (!isMatch) {
    throw new AppError('Invalid email or password.', 401);
  }

  const tokens = generateTokens(user);

  // Return clean user object without passwordHash
  const sanitizedUser = {
    id: user.id,
    email: user.email,
    phone: user.phone,
    role: user.role,
    profile: user.profile
      ? {
          firstName: user.profile.firstName,
          lastName: user.profile.lastName,
          displayName: user.profile.displayName,
          avatarUrl: user.profile.avatarUrl,
        }
      : null,
  };

  return { user: sanitizedUser, tokens };
};

/**
 * Refresh access token using valid refresh token
 */
const refresh = async (refreshToken) => {
  if (!refreshToken) {
    throw new AppError('Refresh token is required.', 401);
  }

  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { profile: true },
    });

    if (!user || !user.isActive) {
      throw new AppError('User session is invalid.', 401);
    }

    const tokens = generateTokens(user);

    const sanitizedUser = {
      id: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
      profile: user.profile,
    };

    return { user: sanitizedUser, tokens };
  } catch (err) {
    throw new AppError('Invalid or expired refresh token. Please sign in again.', 401);
  }
};

/**
 * Get current user profile with addresses
 */
const getCurrentUser = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
      profile: true,
      addresses: {
        orderBy: { isDefault: 'desc' },
      },
    },
  });

  if (!user) {
    throw new AppError('User not found.', 404);
  }

  return user;
};

module.exports = {
  generateTokens,
  register,
  login,
  refresh,
  getCurrentUser,
};
