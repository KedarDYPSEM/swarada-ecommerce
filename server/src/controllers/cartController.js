const cartService = require('../services/cartService');

// Helper to extract userId and sessionId from request
const getCartIdentifier = (req) => {
  const userId = req.user ? req.user.id : null;
  let sessionId = req.cookies?.cart_session_id || req.headers['x-cart-session-id'];

  if (!sessionId && !userId) {
    sessionId = `cart_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  return { userId, sessionId };
};

/**
 * Get current cart
 */
const getCart = async (req, res, next) => {
  try {
    const { userId, sessionId } = getCartIdentifier(req);
    const { coupon } = req.query;

    const cart = await cartService.getCartWithTotals(userId, sessionId, coupon);

    // Set cookie if guest
    if (!req.user && cart.sessionId) {
      res.cookie('cart_session_id', cart.sessionId, {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        httpOnly: true,
        sameSite: 'lax',
      });
    }

    res.status(200).json({
      status: 'success',
      data: cart,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Add item to cart
 */
const addItem = async (req, res, next) => {
  try {
    const cartIdentifier = getCartIdentifier(req);
    const { productId, variantId, quantity } = req.body;

    const cart = await cartService.addItem(cartIdentifier, {
      productId: parseInt(productId, 10),
      variantId: variantId ? parseInt(variantId, 10) : null,
      quantity: quantity ? parseInt(quantity, 10) : 1,
    });

    if (!req.user && cart.sessionId) {
      res.cookie('cart_session_id', cart.sessionId, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: 'lax',
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Saree added to your cart.',
      data: cart,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update item quantity
 */
const updateItem = async (req, res, next) => {
  try {
    const cartIdentifier = getCartIdentifier(req);
    const { id } = req.params;
    const { quantity } = req.body;

    const cart = await cartService.updateItem(cartIdentifier, parseInt(id, 10), parseInt(quantity, 10));

    res.status(200).json({
      status: 'success',
      data: cart,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Remove item from cart
 */
const removeItem = async (req, res, next) => {
  try {
    const cartIdentifier = getCartIdentifier(req);
    const { id } = req.params;

    const cart = await cartService.removeItem(cartIdentifier, parseInt(id, 10));

    res.status(200).json({
      status: 'success',
      message: 'Item removed from cart.',
      data: cart,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCart,
  addItem,
  updateItem,
  removeItem,
};
