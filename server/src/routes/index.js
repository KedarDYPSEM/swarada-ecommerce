const express = require('express');
const authRoutes = require('./authRoutes');
const productRoutes = require('./productRoutes');
const categoryRoutes = require('./categoryRoutes');
const homepageRoutes = require('./homepageRoutes');

const router = express.Router();

// Mount API sub-routers
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/homepage', homepageRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Swarada Saree Center API is operating smoothly',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
