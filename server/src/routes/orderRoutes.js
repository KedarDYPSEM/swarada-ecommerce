const express = require('express');
const orderController = require('../controllers/orderController');
const { authenticate, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Order creation supports both registered users & guests
router.post('/', optionalAuth, orderController.createOrder);

// Customer order history (authenticated)
router.get('/', authenticate, orderController.getMyOrders);
router.get('/:id', authenticate, orderController.getOrderById);

// Public order tracking
router.get('/track/:orderNumber', orderController.trackOrder);

// Cancel order and restore stock
router.post('/:id/cancel', optionalAuth, orderController.cancelOrder);

module.exports = router;
