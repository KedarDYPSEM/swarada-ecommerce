const prisma = require('../config/database');
const { AppError } = require('../middleware/errorHandler');
const { validateCoupon } = require('./couponService');

const FREE_SHIPPING_THRESHOLD = 2999.0;
const STANDARD_SHIPPING_FEE = 150.0;

/**
 * Recalculate totals for cart items securely using actual database prices
 */
const calculateCartTotals = async (items, couponCode = null, userId = null) => {
  let subtotal = 0;
  let totalGst = 0;

  const enrichedItems = items.map((item) => {
    const unitPrice = parseFloat(item.product.sellingPrice);
    const itemTotal = unitPrice * item.quantity;
    const gstRate = parseFloat(item.product.gstRate) || 5.0;
    // GST included in price: GST = itemTotal - (itemTotal / (1 + rate/100))
    const gstAmount = itemTotal - itemTotal / (1 + gstRate / 100);

    subtotal += itemTotal;
    totalGst += gstAmount;

    return {
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      unitPrice,
      totalPrice: itemTotal,
      product: {
        id: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        sku: item.product.sku,
        mrp: parseFloat(item.product.mrp),
        sellingPrice: parseFloat(item.product.sellingPrice),
        fabric: item.product.fabric,
        colour: item.product.colour,
        stockQuantity: item.product.stockQuantity,
        primaryImage: item.product.images?.find((img) => img.isPrimary)?.url || item.product.images?.[0]?.url,
      },
    };
  });

  // Calculate discount if coupon applied
  let discountAmount = 0;
  let couponInfo = null;

  if (couponCode && subtotal > 0) {
    try {
      const validation = await validateCoupon(couponCode, subtotal, userId);
      discountAmount = validation.discountAmount;
      couponInfo = validation.coupon;
    } catch (e) {
      // If coupon validation fails, disregard coupon gracefully
      discountAmount = 0;
      couponInfo = null;
    }
  }

  // Calculate Shipping (Free above ₹2,999)
  const shippingAmount = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : STANDARD_SHIPPING_FEE;
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingAmount);

  return {
    items: enrichedItems,
    summary: {
      subtotal: Math.round(subtotal * 100) / 100,
      discountAmount: Math.round(discountAmount * 100) / 100,
      shippingAmount,
      gstAmount: Math.round(totalGst * 100) / 100,
      totalAmount: Math.round(grandTotal * 100) / 100,
      freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
      amountNeededForFreeShipping: Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal),
      itemCount: enrichedItems.reduce((acc, curr) => acc + curr.quantity, 0),
      coupon: couponInfo,
    },
  };
};

/**
 * Get or create cart for user or guest session
 */
const getOrCreateCart = async (userId = null, sessionId = null) => {
  if (!userId && !sessionId) {
    throw new AppError('Either userId or sessionId must be provided.', 400);
  }

  let cart = null;

  // 1. Try finding by userId if logged in
  if (userId) {
    cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: { images: true },
            },
          },
        },
      },
    });
  }

  // 2. Try finding by sessionId if not found
  if (!cart && sessionId) {
    cart = await prisma.cart.findUnique({
      where: { sessionId },
      include: {
        items: {
          include: {
            product: {
              include: { images: true },
            },
          },
        },
      },
    });
  }

  // 3. Create if does not exist
  if (!cart) {
    const sid = sessionId || `cart_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    cart = await prisma.cart.create({
      data: {
        userId: userId || null,
        sessionId: sid,
      },
      include: {
        items: {
          include: {
            product: {
              include: { images: true },
            },
          },
        },
      },
    });
  }

  // If user just logged in and had a guest sessionId with items, link them!
  if (userId && !cart.userId) {
    cart = await prisma.cart.update({
      where: { id: cart.id },
      data: { userId },
      include: {
        items: {
          include: {
            product: {
              include: { images: true },
            },
          },
        },
      },
    });
  }

  return cart;
};

/**
 * Add item to cart
 */
const addItem = async (cartIdentifier, { productId, variantId = null, quantity = 1 }) => {
  const { userId, sessionId } = cartIdentifier;
  const cart = await getOrCreateCart(userId, sessionId);

  // Verify product exists and is active
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product || !product.isActive) {
    throw new AppError('This saree is no longer available.', 404);
  }

  if (product.stockQuantity < quantity) {
    throw new AppError(`Only ${product.stockQuantity} items available in stock.`, 400);
  }

  // Check if item already in cart
  const existingItem = await prisma.cartItem.findFirst({
    where: {
      cartId: cart.id,
      productId,
      variantId: variantId || null,
    },
  });

  if (existingItem) {
    const newQty = existingItem.quantity + quantity;
    if (product.stockQuantity < newQty) {
      throw new AppError(`Cannot add more. Only ${product.stockQuantity} in stock.`, 400);
    }

    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: newQty },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        variantId: variantId || null,
        quantity,
        unitPrice: product.sellingPrice,
      },
    });
  }

  // Return refreshed cart
  return getCartWithTotals(userId, cart.sessionId);
};

/**
 * Update item quantity in cart
 */
const updateItem = async (cartIdentifier, cartItemId, quantity) => {
  const { userId, sessionId } = cartIdentifier;
  const cart = await getOrCreateCart(userId, sessionId);

  if (quantity <= 0) {
    return removeItem(cartIdentifier, cartItemId);
  }

  const item = await prisma.cartItem.findFirst({
    where: { id: cartItemId, cartId: cart.id },
    include: { product: true },
  });

  if (!item) {
    throw new AppError('Cart item not found.', 404);
  }

  if (item.product.stockQuantity < quantity) {
    throw new AppError(`Only ${item.product.stockQuantity} pieces available in stock.`, 400);
  }

  await prisma.cartItem.update({
    where: { id: cartItemId },
    data: { quantity },
  });

  return getCartWithTotals(userId, cart.sessionId);
};

/**
 * Remove item from cart
 */
const removeItem = async (cartIdentifier, cartItemId) => {
  const { userId, sessionId } = cartIdentifier;
  const cart = await getOrCreateCart(userId, sessionId);

  await prisma.cartItem.deleteMany({
    where: { id: cartItemId, cartId: cart.id },
  });

  return getCartWithTotals(userId, cart.sessionId);
};

/**
 * Clear entire cart
 */
const clearCart = async (cartId) => {
  await prisma.cartItem.deleteMany({
    where: { cartId },
  });
};

/**
 * Get full cart with calculated totals
 */
const getCartWithTotals = async (userId, sessionId, couponCode = null) => {
  const cart = await getOrCreateCart(userId, sessionId);
  const calculated = await calculateCartTotals(cart.items, couponCode, userId);

  return {
    cartId: cart.id,
    sessionId: cart.sessionId,
    ...calculated,
  };
};

module.exports = {
  getOrCreateCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
  getCartWithTotals,
  calculateCartTotals,
};
