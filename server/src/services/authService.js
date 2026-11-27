const { hashPassword, verifyPassword } = require('../utils/password');
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

  // 3. Hash password
  const passwordHash = await hashPassword(password);

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

  // 2. Verify password
  const isMatch = await verifyPassword(user.passwordHash, password);
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

/**
 * Update user profile
 */
const updateProfile = async (userId, data) => {
  const { firstName, lastName, displayName, phone, gender, dateOfBirth, avatarUrl } = data;

  // Check if phone is already used by another user
  if (phone) {
    const existingPhone = await prisma.user.findFirst({
      where: {
        phone,
        NOT: { id: userId },
      },
    });
    if (existingPhone) {
      throw new AppError('This mobile number is already linked to another account.', 409);
    }
  }

  // Parse dateOfBirth safely
  let parsedDob = null;
  if (dateOfBirth) {
    const d = new Date(dateOfBirth);
    if (!isNaN(d.getTime())) {
      parsedDob = d;
    }
  }

  const validGender = gender && ['MALE', 'FEMALE', 'OTHER'].includes(gender) ? gender : null;

  await prisma.$transaction(async (tx) => {
    // 1. Update phone on User model
    await tx.user.update({
      where: { id: userId },
      data: {
        phone: phone || null,
      },
    });

    // 2. Upsert CustomerProfile
    await tx.customerProfile.upsert({
      where: { userId },
      update: {
        firstName,
        lastName,
        displayName: displayName || `${firstName} ${lastName}`.trim(),
        gender: validGender,
        dateOfBirth: parsedDob,
        ...(avatarUrl !== undefined && { avatarUrl }),
      },
      create: {
        userId,
        firstName,
        lastName,
        displayName: displayName || `${firstName} ${lastName}`.trim(),
        gender: validGender,
        dateOfBirth: parsedDob,
        avatarUrl: avatarUrl || null,
      },
    });
  });

  return getCurrentUser(userId);
};

/**
 * Change password
 */
const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError('User not found.', 404);
  }

  const isMatch = await verifyPassword(user.passwordHash, currentPassword);
  if (!isMatch) {
    throw new AppError('The current password you entered is incorrect.', 400);
  }

  if (currentPassword === newPassword) {
    throw new AppError('New password cannot be the same as your current password.', 400);
  }

  const passwordHash = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });

  return { message: 'Password changed successfully.' };
};

module.exports = {
  generateTokens,
  register,
  login,
  refresh,
  getCurrentUser,
  updateProfile,
  changePassword,
};
