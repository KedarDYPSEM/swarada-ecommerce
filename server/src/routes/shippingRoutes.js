const express = require('express');
const shippingController = require('../controllers/shippingController');
const { requireAdmin } = require('../middleware/admin');

const router = express.Router();

// Public Pincode check
router.get('/serviceability', shippingController.checkServiceability);

// Public Tracking by AWB
router.get('/track/:awb', shippingController.trackShipment);

// Admin shipment creation
router.post('/create-awb', requireAdmin, shippingController.createShipment);

module.exports = router;
