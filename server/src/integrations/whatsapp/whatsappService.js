/**
 * WhatsApp Business API Notification Integration
 * Provides structured notification templates and one-click customer care links.
 */

const WHATSAPP_STORE_NUMBER = '919325585754'; // Swarada Kolhapur

/**
 * Generate click-to-chat inquiry link for a specific saree
 */
const getProductInquiryUrl = (product) => {
  const text = encodeURIComponent(
    `Namaste Swarada Sarees! 🙏 I am interested in purchasing:\n\n*${product.name}*\nProduct Code: *${product.sku}*\nPrice: ₹${product.sellingPrice}\n\nCould you please share more real video clips and delivery time to my pincode?`
  );
  return `https://wa.me/${WHATSAPP_STORE_NUMBER}?text=${text}`;
};

/**
 * Format Order Confirmation WhatsApp message
 */
const formatOrderConfirmationMessage = (order) => {
  const itemsList = order.items
    ?.map((item) => `• ${item.productName} (Qty: ${item.quantity}) - ₹${item.total}`)
    .join('\n');

  return `Namaste ${order.shippingName}! 🙏\n\nThank you for shopping at *Swarada Saree Center, Kolhapur*.\n\nYour order *#${order.orderNumber}* has been confirmed:\n\n${itemsList}\n\n*Total Amount:* ₹${order.totalAmount}\n*Payment Method:* ${order.paymentMethod}\n*Delivery City:* ${order.shippingCity}\n\nWe will carefully steam, pack, and notify you as soon as your parcel is dispatched.\n\nFor any customization, reply directly to this chat! ✨`;
};

/**
 * Format Dispatch & Tracking WhatsApp message
 */
const formatShipmentDispatchMessage = (order, shipment) => {
  return `Good news ${order.shippingName}! 📦✨\n\nYour Swarada saree parcel has been dispatched from Kolhapur via *${shipment.provider}*!\n\n*AWB Tracking:* ${shipment.awbNumber}\n*Order #:* ${order.orderNumber}\n*Estimated Delivery:* ${new Date(shipment.estimatedDelivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}\n\nTrack status anytime on our website or reply to this message. Enjoy wearing your authentic handloom!`;
};

/**
 * Send WhatsApp notification (Supports Meta Cloud API webhook or logging fallback)
 */
const sendWhatsAppNotification = async (phone, message) => {
  const WHATSAPP_API_TOKEN = process.env.WHATSAPP_API_TOKEN;
  const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID;

  if (WHATSAPP_API_TOKEN && WHATSAPP_PHONE_ID) {
    try {
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

      await fetch(`https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_ID}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${WHATSAPP_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: formattedPhone,
          type: 'text',
          text: { body: message },
        }),
      });
      return { success: true, mode: 'live' };
    } catch (err) {
      console.warn('WhatsApp API request failed, logged to audit:', err.message);
    }
  }

  // Graceful simulated delivery (logged for store owner audit)
  console.log(`\n💬 [WHATSAPP NOTIFICATION to ${phone}]:\n${message}\n`);
  return { success: true, mode: 'simulated' };
};

module.exports = {
  getProductInquiryUrl,
  formatOrderConfirmationMessage,
  formatShipmentDispatchMessage,
  sendWhatsAppNotification,
};
