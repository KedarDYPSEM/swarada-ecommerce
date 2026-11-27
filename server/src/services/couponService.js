const prisma = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

/**
 * Validate coupon code against subtotal, user history, and product constraints
 */
const validateCoupon = async (code, subtotal, userId = null, items = []) => {
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

  // Check selected products restriction
  let eligibleSubtotal = numSubtotal;
  const restrictedProducts = coupon.couponProducts || [];

  if (restrictedProducts.length > 0) {
    const allowedProductIds = restrictedProducts.map((cp) => cp.productId);

    if (Array.isArray(items) && items.length > 0) {
      const eligibleItems = items.filter((it) => {
        const pId = it.productId || it.product?.id || it.id;
        return allowedProductIds.includes(parseInt(pId, 10));
      });

      if (eligibleItems.length === 0) {
        throw new AppError('This coupon applies only to selected products, none of which are in your order.', 400);
      }

      eligibleSubtotal = eligibleItems.reduce((sum, it) => {
        const price = parseFloat(it.price || it.sellingPrice || it.unitPrice || (it.subtotal ? it.subtotal / (it.quantity || 1) : 0));
        const qty = parseInt(it.quantity, 10) || 1;
        return sum + price * qty;
      }, 0);
    }
  }

  // Calculate discount amount based on eligible subtotal
  let discountAmount = 0;
  if (coupon.discountType === 'PERCENTAGE') {
    discountAmount = (eligibleSubtotal * parseFloat(coupon.discountValue)) / 100;
    if (coupon.maxDiscount && discountAmount > parseFloat(coupon.maxDiscount)) {
      discountAmount = parseFloat(coupon.maxDiscount);
    }
  } else {
    // FIXED amount discount
    discountAmount = parseFloat(coupon.discountValue);
    if (discountAmount > eligibleSubtotal) {
      discountAmount = eligibleSubtotal;
    }
  }

  return {
    coupon: {
      id: coupon.id,
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: parseFloat(coupon.discountValue),
      isProductSpecific: restrictedProducts.length > 0,
    },
    discountAmount: Math.round(discountAmount * 100) / 100,
  };
};

module.exports = {
  validateCoupon,
};
