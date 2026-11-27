const { hashPassword, verifyPassword } = require('../utils/password');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');
const emailService = require('./emailService');
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
  const cleanEmail = (email || '').trim().toLowerCase();

  // 1. Find user by email (case-insensitive)
  let user = await prisma.user.findFirst({
    where: {
      email: cleanEmail,
    },
    include: {
      profile: true,
    },
  });

  // If not found and logging in using any admin domain alias, fallback to the seeded admin
  if (!user && ['admin@swarada.com', 'admin@swaradasaree.com', 'admin@swaradasareecenter.in', 'admin@swaradasareecenter.com', 'kdurugade1005@gmail.com'].includes(cleanEmail)) {
    user = await prisma.user.findFirst({
      where: {
        role: { in: ['ADMIN', 'SUPER_ADMIN'] },
      },
      include: {
        profile: true,
      },
    });
  }

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

/**
 * Request password reset email / temporary password
 */
const forgotPassword = async (email, clientUrl) => {
  const cleanEmail = (email || '').trim().toLowerCase();

  let user = await prisma.user.findFirst({
    where: { email: cleanEmail },
    include: { profile: true },
  });

  // Also check admin aliases
  if (!user && ['admin@swarada.com', 'admin@swaradasaree.com', 'kdurugade1005@gmail.com'].includes(cleanEmail)) {
    user = await prisma.user.findFirst({
      where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
      include: { profile: true },
    });
  }

  if (!user) {
    throw new AppError('No account found matching this email address.', 404);
  }

  // Generate secure temporary password
  const tempPassword = `Swarada@${Math.floor(1000 + Math.random() * 9000)}`;
  const passwordHash = await hashPassword(tempPassword);

  // Update user's password in database so the temporary password works immediately
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  // Generate signed JWT reset token for link
  const resetToken = jwt.sign(
    { id: user.id, email: user.email },
    JWT_ACCESS_SECRET,
    { expiresIn: '1h' }
  );

  const baseUrl = clientUrl || process.env.CLIENT_URL || 'https://swaradasareecenter.in';
  const resetUrl = `${baseUrl}/account/reset-password?token=${resetToken}`;

  const emailRes = await emailService.sendPasswordResetEmail({
    to: user.email,
    resetUrl,
    temporaryPassword: tempPassword,
    recipientName: user.profile?.displayName || (user.role.includes('ADMIN') ? 'Swarada Admin' : 'Valued Patron'),
  });

  return {
    success: true,
    message: `Password reset instructions and new access credentials have been sent to ${user.email}.`,
    emailSent: emailRes.success,
    temporaryPassword: tempPassword,
    userEmail: user.email,
  };
};

/**
 * Reset password using valid reset token
 */
const resetPassword = async (token, newPassword) => {
  try {
    const decoded = jwt.verify(token, JWT_ACCESS_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      throw new AppError('User not found or session has expired.', 404);
    }

    const passwordHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    return { message: 'Password reset successfully. You may now log in with your new password.' };
  } catch (err) {
    throw new AppError('Reset link is invalid or has expired. Please request a new one.', 400);
  }
};

/**
 * Update Admin Credentials (Email / Password)
 */
const updateAdminCredentials = async (adminId, { email, newPassword, currentPassword }) => {
  const admin = await prisma.user.findUnique({
    where: { id: adminId },
  });

  if (!admin || !['ADMIN', 'SUPER_ADMIN'].includes(admin.role)) {
    throw new AppError('Administrator account not found.', 404);
  }

  // Verify current password if provided
  if (currentPassword) {
    const isMatch = await verifyPassword(admin.passwordHash, currentPassword);
    if (!isMatch) {
      throw new AppError('Current password is incorrect.', 400);
    }
  }

  const updateData = {};
  if (email && email.trim() !== '') {
    const cleanEmail = email.trim().toLowerCase();
    // Check if taken by another user
    const existing = await prisma.user.findFirst({
      where: { email: cleanEmail, NOT: { id: adminId } },
    });
    if (existing) {
      throw new AppError(`The email "${cleanEmail}" is already used by another account.`, 409);
    }
    updateData.email = cleanEmail;
  }

  if (newPassword && newPassword.trim() !== '') {
    updateData.passwordHash = await hashPassword(newPassword.trim());
  }

  const updated = await prisma.user.update({
    where: { id: adminId },
    data: updateData,
    select: { id: true, email: true, role: true },
  });

  return updated;
};

module.exports = {
  generateTokens,
  register,
  login,
  refresh,
  getCurrentUser,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  updateAdminCredentials,
};
