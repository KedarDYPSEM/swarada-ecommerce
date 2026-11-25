const argon2 = require('argon2');
const prisma = require('../config/database');
const { AppError } = require('../middleware/errorHandler');
const { validateCoupon } = require('./couponService');
const authService = require('./authService');
const vyaparService = require('../integrations/vyapar/vyaparService');
const emailService = require('./emailService');
const whatsappService = require('../integrations/whatsapp/whatsappService');

const FREE_SHIPPING_THRESHOLD = 2999.0;
const STANDARD_SHIPPING_FEE = 150.0;

/**
 * Generate a unique sequential order number: SW-YYYY-XXXX
 * e.g., SW-2026-1001
 */
const generateOrderNumber = async () => {
  const currentYear = new Date().getFullYear();
  const prefix = `SW-${currentYear}-`;

  const lastOrder = await prisma.order.findFirst({
    where: {
      orderNumber: { startsWith: prefix },
    },
    orderBy: { id: 'desc' },
    select: { orderNumber: true },
  });

  let nextSequence = 1001;
  if (lastOrder && lastOrder.orderNumber) {
    const parts = lastOrder.orderNumber.split('-');
    if (parts.length === 3) {
      const lastSeq = parseInt(parts[2], 10);
      if (!isNaN(lastSeq)) {
        nextSequence = lastSeq + 1;
      }
    }
  }

  return `${prefix}${nextSequence}`;
};

/**
 * Create order with transactional consistency, server-side price recalculation,
 * stock reservation, inventory audit log, and cart clearance.
 */
const createOrder = async (orderData) => {
  const {
    userId = null,
    sessionId = null,
    shippingDetails,
    paymentMethod = 'RAZORPAY',
    couponCode = null,
    notes = null,
  } = orderData;

  if (!shippingDetails) {
    throw new AppError('Shipping address details are required.', 400);
  }

  const {
    shippingName,
    shippingPhone,
    shippingEmail,
    shippingAddressLine1,
    shippingAddressLine2,
    shippingLandmark,
    shippingCity,
    shippingState,
    shippingPincode,
  } = shippingDetails;

  const cleanEmail = shippingEmail && shippingEmail.trim() ? shippingEmail.trim().toLowerCase() : null;
  const cleanPhone = shippingPhone ? shippingPhone.trim().replace(/^\+91/, '') : '';

  if (
    !shippingName?.trim() ||
    !shippingPhone?.trim() ||
    !shippingAddressLine1?.trim() ||
    !shippingAddressLine2?.trim() ||
    !shippingCity?.trim() ||
    !shippingState?.trim() ||
    !shippingPincode?.trim()
  ) {
    throw new AppError(
      'Full address is compulsory for shipping labels. Please fill in Flat/Building, Street/Area, City, State, and Pincode.',
      400
    );
  }

  // 1. Auto-create or link user account for public guest checkout
  let orderUserId = userId;
  let autoCreatedUser = null;
  let authTokens = null;

  if (!orderUserId) {
    try {
      const whereConditions = [];
      if (cleanEmail) whereConditions.push({ email: cleanEmail });
      if (shippingPhone) whereConditions.push({ phone: shippingPhone.trim() });
      if (cleanPhone) whereConditions.push({ phone: `+91${cleanPhone}` }, { phone: cleanPhone });

      const existingUser = whereConditions.length > 0
        ? await prisma.user.findFirst({
            where: { OR: whereConditions },
            include: { profile: true },
          })
        : null;

      if (existingUser) {
        orderUserId = existingUser.id;
        autoCreatedUser = existingUser;
        authTokens = authService.generateTokens(existingUser);
      } else {
        const nameParts = (shippingName || '').trim().split(' ');
        const firstName = nameParts[0] || 'Customer';
        const lastName = nameParts.slice(1).join(' ') || '';
        const autoPassword = `Swarada@${Math.floor(100000 + Math.random() * 900000)}`;
        const passwordHash = await argon2.hash(autoPassword);
        const userEmail = cleanEmail || `${cleanPhone || Date.now()}@customer.swarada.com`;

        const newUser = await prisma.user.create({
          data: {
            email: userEmail,
            phone: shippingPhone ? shippingPhone.trim() : null,
            passwordHash,
            role: 'CUSTOMER',
            profile: {
              create: {
                firstName,
                lastName,
                displayName: shippingName || firstName,
              },
            },
            addresses: {
              create: {
                fullName: shippingName.trim(),
                phone: shippingPhone.trim(),
                addressLine1: shippingAddressLine1.trim(),
                addressLine2: shippingAddressLine2 ? shippingAddressLine2.trim() : null,
                landmark: shippingLandmark ? shippingLandmark.trim() : null,
                city: shippingCity.trim(),
                state: shippingState.trim(),
                pincode: shippingPincode.trim(),
                isDefault: true,
                label: 'Home',
              },
            },
            cart: {
              create: {
                sessionId: `cart_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
              },
            },
            wishlist: {
              create: {},
            },
          },
          include: { profile: true },
        });

        orderUserId = newUser.id;
        autoCreatedUser = newUser;
        authTokens = authService.generateTokens(newUser);
      }
    } catch (authErr) {
      console.warn('Auto account creation warning (proceeding):', authErr.message);
    }
  }

  // Save address into saved addresses book if user is logged in
  if (orderUserId) {
    try {
      const existingAddr = await prisma.customerAddress.findFirst({
        where: {
          userId: orderUserId,
          addressLine1: shippingAddressLine1.trim(),
          pincode: shippingPincode.trim(),
        },
      });

      if (!existingAddr) {
        const addrCount = await prisma.customerAddress.count({ where: { userId: orderUserId } });
        await prisma.customerAddress.create({
          data: {
            userId: orderUserId,
            fullName: shippingName.trim(),
            phone: shippingPhone.trim(),
            addressLine1: shippingAddressLine1.trim(),
            addressLine2: shippingAddressLine2 ? shippingAddressLine2.trim() : null,
            landmark: shippingLandmark ? shippingLandmark.trim() : null,
            city: shippingCity.trim(),
            state: shippingState.trim(),
            pincode: shippingPincode.trim(),
            isDefault: addrCount === 0,
            label: 'Home',
          },
        });
      }
    } catch (addrSaveErr) {
      console.warn('Could not auto-save address to user book:', addrSaveErr.message);
    }
  }

  // 2. Fetch cart (and migrate session cart items if user was auto-created or logged in)
  let cart = null;
  let sessionCartId = null;

  if (sessionId) {
    const sessionCart = await prisma.cart.findUnique({
      where: { sessionId },
      include: {
        items: {
          include: { product: true },
        },
      },
    });
    if (sessionCart && sessionCart.items && sessionCart.items.length > 0) {
      cart = sessionCart;
      sessionCartId = sessionCart.id;
    }
  }

  if ((!cart || !cart.items || cart.items.length === 0) && orderUserId) {
    const userCart = await prisma.cart.findUnique({
      where: { userId: orderUserId },
      include: {
        items: {
          include: { product: true },
        },
      },
    });
    if (userCart && userCart.items && userCart.items.length > 0) {
      cart = userCart;
    }
  }

  // If we have items in sessionCart and a userCart exists, ensure items belong to userCart
  if (cart && orderUserId) {
    const userCart = await prisma.cart.findUnique({
      where: { userId: orderUserId },
    });
    if (userCart && cart.id !== userCart.id) {
      // Transfer items into userCart so order belongs properly to customer's cart
      await prisma.cartItem.updateMany({
        where: { cartId: cart.id },
        data: { cartId: userCart.id },
      });
      cart = await prisma.cart.findUnique({
        where: { id: userCart.id },
        include: {
          items: {
            include: { product: true },
          },
        },
      });
    }
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    throw new AppError('Your cart is empty. Please add items before placing an order.', 400);
  }

  // 2. Perform Order Creation within a Database Transaction
  const order = await prisma.$transaction(async (tx) => {
    let subtotal = 0;
    let totalGst = 0;
    const orderItemsData = [];

    // Verify stock and calculate verified prices
    for (const item of cart.items) {
      // Re-fetch product with row lock equivalent
      const product = await tx.product.findUnique({
        where: { id: item.productId },
      });

      if (!product || !product.isActive) {
        throw new AppError(`The saree "${item.product.name}" is no longer available.`, 400);
      }

      // Check product overall stock
      if (product.stockQuantity < item.quantity) {
        throw new AppError(
          `Insufficient stock for "${product.name}". This saree is currently out of stock.`,
          400
        );
      }

      // Check variant stock if customer selected a specific color/shade
      if (item.variantId) {
        const variant = await tx.productVariant.findUnique({ where: { id: item.variantId } });
        if (!variant || variant.stockQuantity < item.quantity) {
          throw new AppError(
            `Insufficient stock for shade "${variant?.variantValue || 'Selected'}" of "${product.name}". Only ${variant?.stockQuantity || 0} remaining.`,
            400
          );
        }
      }

      const unitPrice = parseFloat(product.sellingPrice);
      const itemTotal = unitPrice * item.quantity;
      const gstRate = parseFloat(product.gstRate) || 5.0;
      const gstAmount = itemTotal - itemTotal / (1 + gstRate / 100);

      subtotal += itemTotal;
      totalGst += gstAmount;

      orderItemsData.push({
        productId: product.id,
        variantId: item.variantId || null,
        productName: product.name,
        productSku: product.sku,
        quantity: item.quantity,
        unitPrice,
        discount: 0,
        gstAmount: Math.round(gstAmount * 100) / 100,
        total: itemTotal,
      });

      // Decrement variant stock if variant item
      if (item.variantId) {
        const variant = await tx.productVariant.findUnique({ where: { id: item.variantId } });
        if (variant) {
          const newVarStock = Math.max(0, variant.stockQuantity - item.quantity);
          await tx.productVariant.update({
            where: { id: variant.id },
            data: { stockQuantity: newVarStock },
          });
        }
      }

      // Decrement stock quantity if greater than 0
      const newStock = Math.max(0, product.stockQuantity - item.quantity);
      await tx.product.update({
        where: { id: product.id },
        data: { stockQuantity: newStock },
      });

      // Update inventory table if present
      await tx.inventory.updateMany({
        where: { productId: product.id },
        data: { quantity: newStock },
      });

      // Record audit inventory movement
      await tx.inventoryMovement.create({
        data: {
          productId: product.id,
          variantId: item.variantId || null,
          movementType: 'SALE',
          quantity: -item.quantity,
          balanceAfter: newStock,
          referenceType: 'ORDER',
          notes: `Customer order placed`,
          createdById: userId || null,
        },
      });
    }

    // 3. Validate & Apply Coupon
    let discountAmount = 0;
    let appliedCoupon = null;

    if (couponCode && subtotal > 0) {
      try {
        const validation = await validateCoupon(couponCode, subtotal, userId);
        discountAmount = validation.discountAmount;
        appliedCoupon = validation.coupon;

        // Increment coupon usage count
        await tx.coupon.update({
          where: { id: appliedCoupon.id },
          data: { usageCount: { increment: 1 } },
        });
      } catch (e) {
        throw new AppError(`Coupon Error: ${e.message}`, 400);
      }
    }

    // 4. Calculate Shipping and Grand Total
    const shippingAmount = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
    const totalAmount = Math.max(0, subtotal - discountAmount + shippingAmount);

    const orderNumber = await generateOrderNumber();

    // 5. Create Order Record
    const newOrder = await tx.order.create({
      data: {
        orderNumber,
        userId: orderUserId || null,
        status: paymentMethod === 'COD' ? 'CONFIRMED' : 'PENDING_PAYMENT',
        shippingName,
        shippingPhone,
        shippingEmail: cleanEmail,
        shippingAddressLine1,
        shippingAddressLine2: shippingAddressLine2 || null,
        shippingLandmark: shippingLandmark || null,
        shippingCity,
        shippingState,
        shippingPincode,
        subtotal,
        discountAmount,
        shippingAmount,
        gstAmount: Math.round(totalGst * 100) / 100,
        totalAmount,
        couponId: appliedCoupon ? appliedCoupon.id : null,
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        paymentMethod: paymentMethod === 'COD' ? 'COD' : 'RAZORPAY',
        paymentStatus: paymentMethod === 'COD' ? 'COD_PENDING' : 'PENDING',
        notes: notes || null,
        confirmedAt: paymentMethod === 'COD' ? new Date() : null,
        items: {
          create: orderItemsData,
        },
        shipment: {
          create: {
            provider: 'Manual',
            status: 'PENDING',
          },
        },
      },
      include: {
        items: true,
        shipment: true,
      },
    });

    // 6. Record Coupon Usage
    if (appliedCoupon) {
      await tx.couponUsage.create({
        data: {
          couponId: appliedCoupon.id,
          userId: orderUserId || null,
          orderId: newOrder.id,
          discountApplied: discountAmount,
        },
      });
    }

    // 7. Clear the cart
    await tx.cartItem.deleteMany({
      where: {
        cartId: { in: sessionCartId && sessionCartId !== cart.id ? [cart.id, sessionCartId] : [cart.id] },
      },
    });

    return newOrder;
  });

  // Background notifications for confirmed orders
  if (order.status === 'CONFIRMED' || paymentMethod === 'COD') {
    vyaparService.queueOrderSale(order).catch((err) => console.warn('Vyapar sync queue error:', err.message));
    emailService.sendOrderConfirmation(order).catch((err) => console.warn('Email dispatch error:', err.message));
    if (order.shippingPhone) {
      whatsappService.sendWhatsAppNotification(
        order.shippingPhone,
        whatsappService.formatOrderConfirmationMessage(order)
      ).catch((err) => console.warn('WhatsApp dispatch error:', err.message));
    }
  }

  return {
    order,
    user: autoCreatedUser,
    authTokens,
  };
};

/**
 * Get customer order by ID
 */
const getOrderById = async (orderId, userId = null) => {
  const where = { id: parseInt(orderId, 10) };
  if (userId) {
    where.userId = userId;
  }

  const order = await prisma.order.findFirst({
    where,
    include: {
      items: {
        include: {
          product: {
            include: { images: true },
          },
        },
      },
      shipment: true,
      payments: true,
    },
  });

  if (!order) {
    throw new AppError('Order not found.', 404);
  }

  return order;
};

/**
 * Get customer orders list
 */
const getOrdersByUser = async (userId) => {
  return prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        include: {
          product: {
            select: {
              name: true,
              sku: true,
              images: { where: { isPrimary: true } },
            },
          },
        },
      },
      shipment: true,
    },
  });
};

/**
 * Track order by public order number
 */
const getOrderByNumber = async (orderNumber) => {
  const order = await prisma.order.findUnique({
    where: { orderNumber: orderNumber.trim() },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      createdAt: true,
      shippingCity: true,
      shippingState: true,
      totalAmount: true,
      items: {
        select: {
          productName: true,
          productSku: true,
          quantity: true,
        },
      },
      shipment: {
        select: {
          provider: true,
          trackingNumber: true,
          awbNumber: true,
          status: true,
          shippedAt: true,
          estimatedDelivery: true,
          deliveredAt: true,
        },
      },
    },
  });

  if (!order) {
    throw new AppError('No order found matching this reference number.', 404);
  }

  return order;
};

/**
 * Cancel an order and restore all item & variant stock back to inventory
 */
const cancelOrderAndRestoreStock = async (orderId, reason = 'Payment cancelled / failed', userId = null) => {
  const numericId = parseInt(orderId, 10);
  if (isNaN(numericId)) {
    throw new AppError('Invalid order ID', 400);
  }

  const order = await prisma.order.findUnique({
    where: { id: numericId },
    include: { items: true, payments: true },
  });

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  // If already cancelled or refunded, no-op
  if (order.status === 'CANCELLED' || order.status === 'REFUNDED') {
    return order;
  }

  // Prevent cancelling delivered orders through payment cancellation
  if (order.status === 'DELIVERED') {
    throw new AppError('Delivered orders cannot be cancelled via payment cancel', 400);
  }

  // Authorization check if user is attached
  if (userId && order.userId && order.userId !== userId) {
    throw new AppError('Unauthorized access to order', 403);
  }

  return prisma.$transaction(async (tx) => {
    // 1. Restore inventory for all order items
    for (const item of order.items) {
      if (item.variantId) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stockQuantity: { increment: item.quantity } },
        });
      }

      await tx.product.update({
        where: { id: item.productId },
        data: { stockQuantity: { increment: item.quantity } },
      });

      await tx.inventory.updateMany({
        where: { productId: item.productId },
        data: { quantity: { increment: item.quantity } },
      });

      await tx.inventoryMovement.create({
        data: {
          productId: item.productId,
          variantId: item.variantId || null,
          movementType: 'RETURN',
          quantity: item.quantity,
          balanceAfter: 0,
          referenceType: 'ORDER_CANCEL',
          notes: `Order #${order.orderNumber} cancelled (${reason}). Restored ${item.quantity} units to stock.`,
          createdById: userId || null,
        },
      });
    }

    // 2. Restore coupon usage if applied
    if (order.couponId) {
      await tx.coupon.update({
        where: { id: order.couponId },
        data: { usageCount: { decrement: 1 } },
      });
      await tx.couponUsage.deleteMany({
        where: { orderId: order.id },
      });
    }

    // 3. Update payment records
    await tx.payment.updateMany({
      where: {
        orderId: order.id,
        status: { in: ['CREATED', 'PENDING'] },
      },
      data: {
        status: 'FAILED',
        errorDescription: reason,
      },
    });

    // 4. Update order status to CANCELLED
    const updatedOrder = await tx.order.update({
      where: { id: order.id },
      data: {
        status: 'CANCELLED',
        paymentStatus: order.paymentStatus === 'COMPLETED' ? 'REFUNDED' : 'FAILED',
        cancelledAt: new Date(),
        cancellationReason: reason,
      },
      include: { items: true },
    });

    return updatedOrder;
  });
};

module.exports = {
  createOrder,
  getOrderById,
  getOrdersByUser,
  getOrderByNumber,
  cancelOrderAndRestoreStock,
};
