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

  const cleanCode = code.trim().toUpperCase();

  const existing = await prisma.coupon.findUnique({ where: { code: cleanCode } });
  if (existing) {
    throw new AppError(`Coupon code "${cleanCode}" already exists.`, 400);
  }

  return prisma.coupon.create({
    data: {
      code: cleanCode,
      description: description || null,
      discountType,
      discountValue: parseFloat(discountValue),
      minOrderValue: minOrderValue ? parseFloat(minOrderValue) : null,
      maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
      usageLimit: usageLimit ? parseInt(usageLimit, 10) : null,
      perUserLimit: parseInt(perUserLimit, 10) || 1,
      isFirstOrderOnly: Boolean(isFirstOrderOnly),
      isActive: Boolean(isActive),
      startsAt: startsAt ? new Date(startsAt) : null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    },
  });
};

const updateCoupon = async (id, data) => {
  const couponId = parseInt(id, 10);
  return prisma.coupon.update({
    where: { id: couponId },
    data: {
      description: data.description,
      isActive: data.isActive,
      usageLimit: data.usageLimit ? parseInt(data.usageLimit, 10) : undefined,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
    },
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
