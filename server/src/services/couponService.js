const prisma = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

/**
 * Validate coupon code against subtotal, user history, and constraints
 */
const validateCoupon = async (code, subtotal, userId = null) => {
  if (!code || !code.trim()) {
    throw new AppError('Coupon code is required.', 400);
  }

  const cleanCode = code.trim().toUpperCase();

  const coupon = await prisma.coupon.findUnique({
    where: { code: cleanCode },
    include: {
      couponProducts: true,
      couponCategories: true,
    },
  });

  if (!coupon || !coupon.isActive) {
    throw new AppError('Invalid or expired coupon code.', 400);
  }

  const now = new Date();
  if (coupon.startsAt && coupon.startsAt > now) {
    throw new AppError('This coupon is not active yet.', 400);
  }

  if (coupon.expiresAt && coupon.expiresAt < now) {
    throw new AppError('This coupon has expired.', 400);
  }

  // Check total usage limit
  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
    throw new AppError('This coupon has reached its maximum usage limit.', 400);
  }

  // Check minimum order value
  const numSubtotal = parseFloat(subtotal) || 0;
  if (coupon.minOrderValue && numSubtotal < parseFloat(coupon.minOrderValue)) {
    throw new AppError(
      `This coupon requires a minimum purchase of ₹${parseFloat(coupon.minOrderValue).toLocaleString('en-IN')}.`,
      400
    );
  }

  // Check first-order restriction
  if (coupon.isFirstOrderOnly && userId) {
    const existingOrdersCount = await prisma.order.count({
      where: {
        userId,
        status: { notIn: ['CANCELLED', 'REFUNDED'] },
      },
    });

    if (existingOrdersCount > 0) {
      throw new AppError('This coupon code is valid only on your first order.', 400);
    }
  }

  // Check per-user usage limit
  if (userId && coupon.perUserLimit) {
    const userUsageCount = await prisma.couponUsage.count({
      where: {
        couponId: coupon.id,
        userId,
      },
    });

    if (userUsageCount >= coupon.perUserLimit) {
      throw new AppError('You have already used this coupon code the maximum allowed times.', 400);
    }
  }

  // Calculate discount amount
  let discountAmount = 0;
  if (coupon.discountType === 'PERCENTAGE') {
    discountAmount = (numSubtotal * parseFloat(coupon.discountValue)) / 100;
    if (coupon.maxDiscount && discountAmount > parseFloat(coupon.maxDiscount)) {
      discountAmount = parseFloat(coupon.maxDiscount);
    }
  } else {
    // FIXED amount discount
    discountAmount = parseFloat(coupon.discountValue);
    if (discountAmount > numSubtotal) {
      discountAmount = numSubtotal;
    }
  }

  return {
    coupon: {
      id: coupon.id,
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: parseFloat(coupon.discountValue),
    },
    discountAmount: Math.round(discountAmount * 100) / 100,
  };
};

module.exports = {
  validateCoupon,
};
