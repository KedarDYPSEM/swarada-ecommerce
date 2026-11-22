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
const adminRoutes = require('./adminRoutes');
const paymentRoutes = require('./paymentRoutes');
const shippingRoutes = require('./shippingRoutes');
const vyaparRoutes = require('./vyaparRoutes');
const reviewRoutes = require('./reviewRoutes');
const uploadRoutes = require('./uploadRoutes');
const settingsRoutes = require('./settingsRoutes');

const router = express.Router();

// Mount all REST endpoints
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/products', reviewRoutes);
router.use('/categories', categoryRoutes);
router.use('/homepage', homepageRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/customer', customerRoutes);
router.use('/coupons', couponRoutes);
router.use('/admin', adminRoutes);
router.use('/upload', uploadRoutes);
router.use('/settings', settingsRoutes);
router.use('/payment', paymentRoutes);
router.use('/shipping', shippingRoutes);
router.use('/integrations/vyapar', vyaparRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Swarada Saree Center API is operating smoothly',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
