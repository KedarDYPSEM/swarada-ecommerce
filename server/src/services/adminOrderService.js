const prisma = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

/**
 * List orders for Admin with status filtering and search
 */
const listOrders = async (query = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 15));
  const skip = (page - 1) * limit;

  const where = {};

  if (query.status) {
    where.status = query.status;
  }

  if (query.search) {
    const term = query.search.trim();
    where.OR = [
      { orderNumber: { contains: term } },
      { shippingName: { contains: term } },
      { shippingPhone: { contains: term } },
      { shippingEmail: { contains: term } },
    ];
  }

  if (query.paymentMethod) {
    where.paymentMethod = query.paymentMethod;
  }

  const [orders, totalCount] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        shipment: true,
        user: {
          select: {
            id: true,
            email: true,
            profile: { select: { firstName: true, lastName: true } },
          },
        },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return {
    orders,
    pagination: {
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    },
  };
};

/**
 * Get comprehensive order details for admin
 */
const getOrderDetails = async (id) => {
  const order = await prisma.order.findUnique({
    where: { id: parseInt(id, 10) },
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
      user: {
        include: { profile: true },
      },
      coupon: true,
    },
  });

  if (!order) {
    throw new AppError('Order not found.', 404);
  }

  return order;
};

/**
 * Update order status
 */
const updateOrderStatus = async (id, status, adminNotes = null) => {
  const orderId = parseInt(id, 10);
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    throw new AppError('Order not found.', 404);
  }

  const updateData = {
    status,
    adminNotes: adminNotes || order.adminNotes,
  };

  if (status === 'CONFIRMED' && !order.confirmedAt) updateData.confirmedAt = new Date();
  if (status === 'SHIPPED' && !order.shippedAt) updateData.shippedAt = new Date();
  if (status === 'DELIVERED' && !order.deliveredAt) updateData.deliveredAt = new Date();
  if (status === 'CANCELLED' && !order.cancelledAt) updateData.cancelledAt = new Date();

  return prisma.order.update({
    where: { id: orderId },
    data: updateData,
    include: {
      items: true,
      shipment: true,
    },
  });
};

/**
 * Add or update shipping and courier tracking details
 */
const updateTracking = async (id, trackingData) => {
  const orderId = parseInt(id, 10);
  const { provider = 'Delhivery', trackingNumber, awbNumber } = trackingData;

  const existingShipment = await prisma.shipment.findUnique({ where: { orderId } });

  if (existingShipment) {
    await prisma.shipment.update({
      where: { orderId },
      data: {
        provider,
        trackingNumber: trackingNumber || existingShipment.trackingNumber,
        awbNumber: awbNumber || existingShipment.awbNumber,
        status: 'IN_TRANSIT',
        shippedAt: new Date(),
      },
    });
  } else {
    await prisma.shipment.create({
      data: {
        orderId,
        provider,
        trackingNumber,
        awbNumber,
        status: 'IN_TRANSIT',
        shippedAt: new Date(),
      },
    });
  }

  // Update order status to SHIPPED
  return updateOrderStatus(orderId, 'SHIPPED', `Dispatched via ${provider}. AWB: ${awbNumber || trackingNumber}`);
};

/**
 * Cancel order and restore product inventory
 */
const cancelOrder = async (id, reason) => {
  const orderId = parseInt(id, 10);
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order) {
    throw new AppError('Order not found.', 404);
  }

  if (order.status === 'CANCELLED') {
    throw new AppError('This order is already cancelled.', 400);
  }

  return prisma.$transaction(async (tx) => {
    // 1. Restore inventory for all items
    for (const item of order.items) {
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
          movementType: 'RETURN',
          quantity: item.quantity,
          balanceAfter: 0, // balance recalculated on read
          referenceType: 'ORDER_CANCEL',
          notes: `Order #${order.orderNumber} cancelled. Restored ${item.quantity} units.`,
        },
      });
    }

    // 2. Mark order as cancelled
    const updated = await tx.order.update({
      where: { id: orderId },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancellationReason: reason || 'Cancelled by administrator',
      },
      include: { items: true },
    });

    return updated;
  });
};

module.exports = {
  listOrders,
  getOrderDetails,
  updateOrderStatus,
  updateTracking,
  cancelOrder,
};
