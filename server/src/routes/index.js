const express = require('express');
const authRoutes = require('./authRoutes');
const productRoutes = require('./productRoutes');
const categoryRoutes = require('./categoryRoutes');
const homepageRoutes = require('./homepageRoutes');
const cartRoutes = require('./cartRoutes');
const orderRoutes = require('./orderRoutes');
const wishlistRoutes = require('./wishlistRoutes');
const customerRoutes = require('./customerRoutes');
const couponRoutes = require('./couponRoutes');

const router = express.Router();

// Mount all REST endpoints
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/homepage', homepageRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/customer', customerRoutes);
router.use('/coupons', couponRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Swarada Saree Center API is operating smoothly',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
