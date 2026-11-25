const crypto = require('crypto');
const prisma = require('../../config/database');
const { AppError } = require('../../middleware/errorHandler');
const { getRazorpayConfig } = require('./razorpayClient');
const vyaparService = require('../vyapar/vyaparService');
const emailService = require('../../services/emailService');
const whatsappService = require('../whatsapp/whatsappService');

/**
 * Server-side Razorpay Order Initiation
 * Ensures backend is sole authority for amount and currency.
 */
const createRazorpayOrder = async (orderId, userId = null) => {
  const order = await prisma.order.findUnique({
    where: { id: parseInt(orderId, 10) },
    include: { items: true },
  });

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  // Check ownership if authenticated user
  if (userId && order.userId && order.userId !== userId) {
    throw new AppError('Unauthorized access to order', 403);
  }

  if (order.status === 'DELIVERED' || order.status === 'CANCELLED') {
    throw new AppError(`Cannot initiate payment for ${order.status.toLowerCase()} order`, 400);
  }

  const amountPaise = Math.round(parseFloat(order.totalAmount) * 100);
  const config = await getRazorpayConfig();

  let razorpayOrder;
  if (config.razorpay && config.isRealKey) {
    try {
      razorpayOrder = await config.razorpay.orders.create({
        amount: amountPaise,
        currency: 'INR',
        receipt: order.orderNumber,
        notes: {
          orderId: order.id.toString(),
          orderNumber: order.orderNumber,
        },
      });
    } catch (err) {
      console.error('❌ Razorpay orders.create failed:', err.message, err.error || '');
      // If Razorpay API rejects (e.g. invalid key/secret), throw clear explanation
      throw new AppError(
        `Razorpay error: ${err.error?.description || err.message || 'Authentication failed'}. Please check your Key ID and Key Secret in Admin Settings.`,
        400
      );
    }
  } else {
    // Mock / Offline Development Fallback
    razorpayOrder = {
      id: `order_mock_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      entity: 'order',
      amount: amountPaise,
      currency: 'INR',
      receipt: order.orderNumber,
      status: 'created',
    };
  }

  // Record payment session in database
  const payment = await prisma.payment.create({
    data: {
      orderId: order.id,
      razorpayOrderId: razorpayOrder.id,
      amount: order.totalAmount,
      currency: 'INR',
      status: 'CREATED',
      method: 'RAZORPAY',
      rawResponse: razorpayOrder,
    },
  });

  const isMock = Boolean(!config.isRealKey || !config.razorpay || razorpayOrder.id.startsWith('order_mock_'));

  return {
    razorpayOrderId: razorpayOrder.id,
    amount: parseFloat(order.totalAmount),
    amountPaise,
    currency: 'INR',
    keyId: config.keyId,
    orderNumber: order.orderNumber,
    paymentId: payment.id,
    isMock,
    customer: {
      name: order.shippingName,
      email: order.shippingEmail,
      phone: order.shippingPhone,
    },
  };
};

/**
 * Verify Razorpay payment signature
 * Verifies HMAC sha256: razorpay_order_id + "|" + razorpay_payment_id
 */
const verifyPaymentSignature = async ({
  orderId,
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}) => {
  if (!razorpayOrderId || !razorpayPaymentId) {
    throw new AppError('Incomplete payment verification details', 400);
  }

  const order = await prisma.order.findUnique({
    where: { id: parseInt(orderId, 10) },
  });

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  // Verify HMAC signature
  const config = await getRazorpayConfig();
  const body = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', config.keySecret)
    .update(body.toString())
    .digest('hex');

  // Allow signature match or mock bypass for development orders
  const isMockOrder = razorpayOrderId.startsWith('order_mock_') || razorpayOrderId.startsWith('order_test_');
  const isSignatureValid = expectedSignature === razorpaySignature || (isMockOrder && razorpaySignature === 'mock_valid_signature');

  if (!isSignatureValid) {
    // Record payment failure audit
    await prisma.payment.updateMany({
      where: { razorpayOrderId },
      data: {
        status: 'FAILED',
        errorCode: 'SIGNATURE_MISMATCH',
        errorDescription: 'Payment signature verification failed',
      },
    });

    throw new AppError('Invalid payment signature. Payment cannot be verified.', 400);
  }

  // Transactionally update Order and Payment
  const result = await prisma.$transaction(async (tx) => {
    // 1. Update Payment status
    const payment = await tx.payment.updateMany({
      where: { razorpayOrderId },
      data: {
        razorpayPaymentId,
        razorpaySignature,
        status: 'CAPTURED',
      },
    });

    // 2. Update Order status
    const updatedOrder = await tx.order.update({
      where: { id: order.id },
      data: {
        status: 'CONFIRMED',
        paymentStatus: 'COMPLETED',
        paymentMethod: 'RAZORPAY',
        confirmedAt: new Date(),
      },
      include: {
        items: true,
      },
    });

    return updatedOrder;
  });

  // Background notifications and Vyapar queueing for paid orders
  vyaparService.queueOrderSale(result).catch((err) => console.warn('Vyapar sync queue error:', err.message));
  emailService.sendOrderConfirmation(result).catch((err) => console.warn('Email dispatch error:', err.message));
  if (result.shippingPhone) {
    whatsappService.sendWhatsAppNotification(
      result.shippingPhone,
      whatsappService.formatOrderConfirmationMessage(result)
    ).catch((err) => console.warn('WhatsApp dispatch error:', err.message));
  }

  return {
    success: true,
    message: 'Payment verified and order confirmed successfully',
    order: result,
  };
};

/**
 * Webhook handler with Idempotency Protection
 */
const handleWebhook = async (rawBody, signature) => {
  const config = await getRazorpayConfig();
  // 1. Verify webhook signature
  if (config.webhookSecret && signature) {
    const expectedSignature = crypto
      .createHmac('sha256', config.webhookSecret)
      .update(rawBody)
      .digest('hex');

    if (expectedSignature !== signature) {
      throw new AppError('Invalid webhook signature', 400);
    }
  }

  const event = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody;
  const eventId = event.event_id || event.id || `evt_${Date.now()}`;
  const eventType = event.event || 'unknown';

  // 2. Idempotency Check: Don't process duplicate webhook events
  const existingEvent = await prisma.paymentWebhook.findUnique({
    where: { eventId },
  });

  if (existingEvent) {
    console.log(`Webhook event ${eventId} already processed or received. Skipping.`);
    return { status: 'already_processed', eventId };
  }

  // 3. Record webhook receipt
  const webhookRecord = await prisma.paymentWebhook.create({
    data: {
      eventId,
      eventType,
      payload: event,
      processingStatus: 'RECEIVED',
    },
  });

  try {
    const payload = event.payload || {};

    if (eventType === 'payment.captured' || eventType === 'order.paid') {
      const paymentEntity = payload.payment?.entity;
      const razorpayOrderId = paymentEntity?.order_id || payload.order?.entity?.id;
      const razorpayPaymentId = paymentEntity?.id;

      if (razorpayOrderId) {
        await prisma.$transaction(async (tx) => {
          await tx.payment.updateMany({
            where: { razorpayOrderId },
            data: {
              razorpayPaymentId: razorpayPaymentId || undefined,
              status: 'CAPTURED',
              method: paymentEntity?.method || 'RAZORPAY',
            },
          });

          await tx.order.updateMany({
            where: {
              payments: { some: { razorpayOrderId } },
            },
            data: {
              status: 'CONFIRMED',
              paymentStatus: 'COMPLETED',
              confirmedAt: new Date(),
            },
          });
        });
      }
    } else if (eventType === 'payment.failed') {
      const paymentEntity = payload.payment?.entity;
      const razorpayOrderId = paymentEntity?.order_id;

      if (razorpayOrderId) {
        const payment = await prisma.payment.findFirst({
          where: { razorpayOrderId },
        });

        if (payment && payment.orderId) {
          const orderService = require('../../services/orderService');
          await orderService.cancelOrderAndRestoreStock(
            payment.orderId,
            `Razorpay payment failed (${paymentEntity.error_description || paymentEntity.error_code || 'Payment failure'})`
          ).catch((e) => console.warn('Webhook auto-cancel error:', e.message));
        } else {
          await prisma.payment.updateMany({
            where: { razorpayOrderId },
            data: {
              status: 'FAILED',
              errorCode: paymentEntity.error_code,
              errorDescription: paymentEntity.error_description,
            },
          });
        }
      }
    }

    // Mark webhook PROCESSED
    await prisma.paymentWebhook.update({
      where: { id: webhookRecord.id },
      data: {
        processingStatus: 'PROCESSED',
        processedAt: new Date(),
      },
    });

    return { status: 'processed', eventId };
  } catch (err) {
    await prisma.paymentWebhook.update({
      where: { id: webhookRecord.id },
      data: {
        processingStatus: 'FAILED',
        errorMessage: err.message,
      },
    });
    throw err;
  }
};

/**
 * Process Refund via Razorpay
 */
const processRefund = async (orderId, amount = null, reason = 'Customer request / Return') => {
  const order = await prisma.order.findUnique({
    where: { id: parseInt(orderId, 10) },
    include: { payments: true },
  });

  if (!order) throw new AppError('Order not found', 404);

  const payment = order.payments.find((p) => p.status === 'CAPTURED');
  if (!payment || !payment.razorpayPaymentId) {
    throw new AppError('No captured payment available for refund', 400);
  }

  const refundAmount = amount ? parseFloat(amount) : parseFloat(order.totalAmount);
  const refundPaise = Math.round(refundAmount * 100);

  let razorpayRefund;
  if (razorpay && !payment.razorpayPaymentId.startsWith('pay_mock_')) {
    razorpayRefund = await razorpay.payments.refund(payment.razorpayPaymentId, {
      amount: refundPaise,
      notes: { orderNumber: order.orderNumber, reason },
    });
  } else {
    razorpayRefund = {
      id: `rfnd_mock_${Date.now()}`,
      amount: refundPaise,
      status: 'processed',
    };
  }

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: payment.id },
      data: { status: 'REFUNDED' },
    });

    await tx.order.update({
      where: { id: order.id },
      data: {
        status: 'REFUNDED',
        paymentStatus: 'REFUNDED',
      },
    });
  });

  return { success: true, refund: razorpayRefund };
};

module.exports = {
  createRazorpayOrder,
  verifyPaymentSignature,
  handleWebhook,
  processRefund,
};
