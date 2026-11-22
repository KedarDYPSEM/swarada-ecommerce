const express = require('express');
const paymentController = require('../controllers/paymentController');
const { optionalAuth, authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');

const router = express.Router();

// Allow guests or logged-in users to initiate and verify payment
router.post('/initiate', optionalAuth, paymentController.initiatePayment);
router.post('/verify', optionalAuth, paymentController.verifyPayment);

// Razorpay Webhook (Direct from Razorpay servers)
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.handleWebhook);

// Admin Refund
router.post('/refund', requireAdmin, paymentController.processRefund);

module.exports = router;
