const adminCouponService = require('../services/adminCouponService');
const { catchAsync } = require('../middleware/errorHandler');

const listCoupons = catchAsync(async (req, res) => {
  const coupons = await adminCouponService.listCoupons();
  res.json({
    success: true,
    data: coupons,
  });
});

const createCoupon = catchAsync(async (req, res) => {
  const coupon = await adminCouponService.createCoupon(req.body);
  res.status(201).json({
    success: true,
    message: 'Coupon created successfully',
    data: coupon,
  });
});

const updateCoupon = catchAsync(async (req, res) => {
  const coupon = await adminCouponService.updateCoupon(req.params.id, req.body);
  res.json({
    success: true,
    message: 'Coupon updated successfully',
    data: coupon,
  });
});

const deleteCoupon = catchAsync(async (req, res) => {
  await adminCouponService.deleteCoupon(req.params.id);
  res.json({
    success: true,
    message: 'Coupon deleted successfully',
  });
});

module.exports = {
  listCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
};
