const orderService = require('../services/orderService');

/**
 * Place a new order
 */
const createOrder = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;
    const sessionId = req.cookies?.cart_session_id || req.headers['x-cart-session-id'];

    const order = await orderService.createOrder({
      userId,
      sessionId,
      shippingDetails: req.body.shippingDetails,
      paymentMethod: req.body.paymentMethod || 'RAZORPAY',
      couponCode: req.body.couponCode,
      notes: req.body.notes,
    });

    res.status(201).json({
      status: 'success',
      message: 'Order placed successfully! Thank you for choosing Swarada Saree Center.',
      data: { order },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get customer orders list
 */
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await orderService.getOrdersByUser(req.user.id);
    res.status(200).json({
      status: 'success',
      data: { orders },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get order details by ID
 */
const getOrderById = async (req, res, next) => {
  try {
    const userId = req.user && req.user.role === 'CUSTOMER' ? req.user.id : null;
    const order = await orderService.getOrderById(req.params.id, userId);

    res.status(200).json({
      status: 'success',
      data: { order },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Public order tracking endpoint
 */
const trackOrder = async (req, res, next) => {
  try {
    const { orderNumber } = req.params;
    const order = await orderService.getOrderByNumber(orderNumber);

    res.status(200).json({
      status: 'success',
      data: { order },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  trackOrder,
};
