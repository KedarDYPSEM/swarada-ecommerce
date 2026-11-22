const razorpayService = require('../integrations/razorpay/razorpayService');
const { catchAsync, AppError } = require('../middleware/errorHandler');

/**
 * Initiate Razorpay checkout session
 */
const initiatePayment = catchAsync(async (req, res) => {
  const { orderId } = req.body;
  if (!orderId) {
    throw new AppError('Order ID is required to initiate payment', 400);
  }

  const result = await razorpayService.createRazorpayOrder(orderId, req.user?.id);
  res.status(200).json({
    success: true,
    data: result,
  });
});

/**
 * Verify Razorpay payment signature
 */
const verifyPayment = catchAsync(async (req, res) => {
  const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

  const result = await razorpayService.verifyPaymentSignature({
    orderId,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  });

  res.status(200).json(result);
});

/**
 * Razorpay Webhook Endpoint
 */
const handleWebhook = catchAsync(async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const rawBody = req.rawBody || JSON.stringify(req.body);

  const result = await razorpayService.handleWebhook(rawBody, signature);
  res.status(200).json({ status: 'ok', result });
});

/**
 * Admin Refund
 */
const processRefund = catchAsync(async (req, res) => {
  const { orderId, amount, reason } = req.body;
  const result = await razorpayService.processRefund(orderId, amount, reason);
  res.status(200).json(result);
});

module.exports = {
  initiatePayment,
  verifyPayment,
  handleWebhook,
  processRefund,
};
