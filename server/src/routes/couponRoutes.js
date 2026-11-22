const express = require('express');
const { validateCoupon } = require('../services/couponService');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/validate', optionalAuth, async (req, res, next) => {
  try {
    const { code, subtotal } = req.body;
    const userId = req.user ? req.user.id : null;

    const result = await validateCoupon(code, subtotal, userId);
    res.status(200).json({
      status: 'success',
      message: `Coupon "${result.coupon.code}" applied!`,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
