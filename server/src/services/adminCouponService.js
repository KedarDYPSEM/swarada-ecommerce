const prisma = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

const listCoupons = async () => {
  return prisma.coupon.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { usages: true },
      },
    },
  });
};

const createCoupon = async (data) => {
  const {
    code,
    description,
    discountType = 'PERCENTAGE',
    discountValue,
    minOrderValue,
    maxDiscount,
    usageLimit,
    perUserLimit = 1,
    isFirstOrderOnly = false,
    isActive = true,
    startsAt,
    expiresAt,
  } = data;

  if (!code || !code.trim()) {
    throw new AppError('Coupon code is required.', 400);
  }

  const cleanCode = code.trim().toUpperCase();
  const numDiscount = parseFloat(discountValue);
  if (isNaN(numDiscount) || numDiscount <= 0) {
    throw new AppError('Please provide a valid discount value greater than 0.', 400);
  }

  // Normalize discountType to Prisma enum: 'PERCENTAGE' | 'FIXED'
  const normalizedDiscountType =
    discountType === 'FIXED_AMOUNT' || discountType === 'FIXED' ? 'FIXED' : 'PERCENTAGE';

  const existing = await prisma.coupon.findUnique({ where: { code: cleanCode } });
  if (existing) {
    throw new AppError(`Coupon code "${cleanCode}" already exists.`, 400);
  }

  const parseDateSafe = (d) => {
    if (!d) return null;
    const parsed = new Date(d);
    return isNaN(parsed.getTime()) ? null : parsed;
  };

  return prisma.coupon.create({
    data: {
      code: cleanCode,
      description: description ? description.trim() : null,
      discountType: normalizedDiscountType,
      discountValue: numDiscount,
      minOrderValue: minOrderValue ? parseFloat(minOrderValue) : null,
      maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
      usageLimit: usageLimit ? parseInt(usageLimit, 10) : null,
      perUserLimit: parseInt(perUserLimit, 10) || 1,
      isFirstOrderOnly: Boolean(isFirstOrderOnly),
      isActive: Boolean(isActive),
      startsAt: parseDateSafe(startsAt),
      expiresAt: parseDateSafe(expiresAt),
    },
  });
};

const updateCoupon = async (id, data) => {
  const couponId = parseInt(id, 10);
  if (isNaN(couponId)) {
    throw new AppError('Invalid coupon ID.', 400);
  }

  const parseDateSafe = (d) => {
    if (d === null) return null;
    if (!d) return undefined;
    const parsed = new Date(d);
    return isNaN(parsed.getTime()) ? undefined : parsed;
  };

  const updatePayload = {};
  if (data.description !== undefined) updatePayload.description = data.description ? data.description.trim() : null;
  if (data.discountType !== undefined) {
    updatePayload.discountType =
      data.discountType === 'FIXED_AMOUNT' || data.discountType === 'FIXED' ? 'FIXED' : 'PERCENTAGE';
  }
  if (data.discountValue !== undefined) {
    const val = parseFloat(data.discountValue);
    if (!isNaN(val) && val > 0) updatePayload.discountValue = val;
  }
  if (data.minOrderValue !== undefined) {
    updatePayload.minOrderValue = data.minOrderValue ? parseFloat(data.minOrderValue) : null;
  }
  if (data.maxDiscount !== undefined) {
    updatePayload.maxDiscount = data.maxDiscount ? parseFloat(data.maxDiscount) : null;
  }
  if (data.usageLimit !== undefined) {
    updatePayload.usageLimit = data.usageLimit ? parseInt(data.usageLimit, 10) : null;
  }
  if (data.perUserLimit !== undefined) {
    updatePayload.perUserLimit = parseInt(data.perUserLimit, 10) || 1;
  }
  if (data.isFirstOrderOnly !== undefined) updatePayload.isFirstOrderOnly = Boolean(data.isFirstOrderOnly);
  if (data.isActive !== undefined) updatePayload.isActive = Boolean(data.isActive);
  if (data.expiresAt !== undefined) updatePayload.expiresAt = parseDateSafe(data.expiresAt);

  return prisma.coupon.update({
    where: { id: couponId },
    data: updatePayload,
  });
};

const deleteCoupon = async (id) => {
  return prisma.coupon.delete({
    where: { id: parseInt(id, 10) },
  });
};

module.exports = {
  listCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
};
