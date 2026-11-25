const orderService = require('../services/orderService');

const isProduction = process.env.NODE_ENV === 'production';
const getCookieOptions = (maxAgeMs) => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  maxAge: maxAgeMs,
  path: '/',
});

/**
 * Place a new order (with auto-account creation for public guests)
 */
const createOrder = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;
    const sessionId = req.cookies?.cart_session_id || req.headers['x-cart-session-id'];

    const result = await orderService.createOrder({
      userId,
      sessionId,
      shippingDetails: req.body.shippingDetails,
      paymentMethod: req.body.paymentMethod || 'RAZORPAY',
      couponCode: req.body.couponCode,
      notes: req.body.notes,
    });

    // If an account was automatically linked or created, set auth cookies immediately
    if (result.authTokens) {
      res.cookie('access_token', result.authTokens.accessToken, getCookieOptions(15 * 60 * 1000));
      res.cookie('refresh_token', result.authTokens.refreshToken, getCookieOptions(7 * 24 * 60 * 60 * 1000));
    }

    res.status(201).json({
      status: 'success',
      message: 'Order placed successfully! Account created & logged in.',
      data: {
        order: result.order,
        user: result.user,
        accessToken: result.authTokens?.accessToken,
      },
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

/**
 * Cancel order and restore stock
 */
const cancelOrder = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const reason = req.body.reason || 'Cancelled by customer';
    const userId = req.user ? req.user.id : null;

    const order = await orderService.cancelOrderAndRestoreStock(orderId, reason, userId);

    res.status(200).json({
      status: 'success',
      message: 'Order cancelled and stock restored to inventory',
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
  cancelOrder,
};
