const express = require('express');
const authRoutes = require('./authRoutes');

const router = express.Router();

// Mount sub-routers
router.use('/auth', authRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Swarada Saree Center API is operating smoothly',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
