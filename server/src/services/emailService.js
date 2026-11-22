const nodemailer = require('nodemailer');

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT || 587;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM || '"Swarada Saree Center" <orders@swaradasarees.com>';

let transporter = null;

const getTransporter = async () => {
  if (transporter) return transporter;

  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    transporter = nodemailer.createTransporter({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT, 10),
      secure: SMTP_PORT == 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
  } else {
    // Ethereal / Stream fallback for seamless local execution
    transporter = nodemailer.createTransport({
      streamTransport: true,
      newline: 'unix',
      buffer: true,
    });
  }

  return transporter;
};

/**
 * Send Order Confirmation Email
 */
const sendOrderConfirmation = async (order) => {
  if (!order.shippingEmail || order.shippingEmail.includes('@customer.swarada.com')) return;

  const mailer = await getTransporter();

  const itemsHtml = order.items
    ?.map(
      (it) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        <strong>${it.productName}</strong><br/>
        <span style="font-size: 11px; color: #777;">Code: ${it.sku}</span>
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${it.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${it.total}</td>
    </tr>
  `
    )
    .join('');

  const html = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #292323; background-color: #FFF9F0; padding: 24px; border: 1px solid #e0d5c1; border-radius: 8px;">
      <div style="text-align: center; border-bottom: 2px solid #C5A05A; padding-bottom: 16px;">
        <h1 style="color: #641B32; margin: 0; font-size: 24px; font-weight: bold; letter-spacing: 1px;">SWARADA SAREE CENTER</h1>
        <p style="color: #C5A05A; margin: 4px 0 0; font-size: 12px; letter-spacing: 2px; text-transform: uppercase;">Kolhapur • Pure Handloom Tradition</p>
      </div>

      <div style="padding: 20px 0;">
        <h2 style="color: #641B32; font-size: 18px;">Namaste ${order.shippingName},</h2>
        <p style="font-size: 14px; line-height: 1.6;">Thank you for your order! We are delighted to prepare your authentic handloom sarees with our signature packaging.</p>

        <div style="background: #ffffff; padding: 16px; border-radius: 6px; margin: 20px 0; border: 1px solid #eee;">
          <p style="margin: 0 0 10px; font-size: 13px;"><strong>Order Reference:</strong> <span style="color: #641B32;">${order.orderNumber}</span></p>
          <p style="margin: 0 0 10px; font-size: 13px;"><strong>Payment Method:</strong> ${order.paymentMethod} (${order.paymentStatus})</p>
          <p style="margin: 0; font-size: 13px;"><strong>Delivery Destination:</strong> ${order.shippingAddress1}, ${order.shippingCity}, ${order.shippingState} - ${order.shippingPincode}</p>
        </div>

        <h3 style="font-size: 14px; color: #641B32; text-transform: uppercase; letter-spacing: 1px;">Items in Your Order</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; background: #ffffff; border-radius: 6px; overflow: hidden;">
          <thead>
            <tr style="background-color: #641B32; color: #ffffff;">
              <th style="padding: 10px; text-align: left;">Saree</th>
              <th style="padding: 10px; text-align: center;">Qty</th>
              <th style="padding: 10px; text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding: 12px 10px; text-align: right; font-weight: bold; font-size: 14px;">Total Payable:</td>
              <td style="padding: 12px 10px; text-align: right; font-weight: bold; font-size: 16px; color: #641B32;">₹${order.totalAmount}</td>
            </tr>
          </tfoot>
        </table>

        <div style="margin-top: 24px; text-align: center; font-size: 12px; color: #777;">
          <p>Questions about your order? WhatsApp us at <strong>+91 98220 12345</strong> or email support@swaradasarees.com</p>
          <p>Swarada Saree Center, Mahadwar Road, Kolhapur, Maharashtra 416002</p>
        </div>
      </div>
    </div>
  `;

  try {
    const info = await mailer.sendMail({
      from: EMAIL_FROM,
      to: order.shippingEmail,
      subject: `Order Confirmed: ${order.orderNumber} – Swarada Saree Center, Kolhapur`,
      html,
    });
    console.log(`✉️ Order confirmation email queued for ${order.shippingEmail}`);
    return info;
  } catch (err) {
    console.warn('Failed to send confirmation email:', err.message);
  }
};

/**
 * Send Shipping Dispatch Email
 */
const sendShippingDispatch = async (order, shipment) => {
  if (!order.shippingEmail || order.shippingEmail.includes('@customer.swarada.com')) return;

  const mailer = await getTransporter();

  const html = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #292323; background-color: #FFF9F0; padding: 24px; border: 1px solid #e0d5c1; border-radius: 8px;">
      <div style="text-align: center; border-bottom: 2px solid #C5A05A; padding-bottom: 16px;">
        <h1 style="color: #641B32; margin: 0; font-size: 24px; font-weight: bold;">SWARADA SAREE CENTER</h1>
        <p style="color: #C5A05A; margin: 4px 0 0; font-size: 12px; letter-spacing: 2px;">Your Consignment is on its way!</p>
      </div>

      <div style="padding: 20px 0;">
        <h2 style="color: #641B32; font-size: 18px;">Good News ${order.shippingName}!</h2>
        <p style="font-size: 14px; line-height: 1.6;">Your package has been carefully steamed, packaged in silk mark protective covers, and handed over to our courier partner.</p>

        <div style="background: #ffffff; padding: 16px; border-radius: 6px; margin: 20px 0; border: 1px solid #eee;">
          <p style="margin: 0 0 10px; font-size: 13px;"><strong>Order ID:</strong> ${order.orderNumber}</p>
          <p style="margin: 0 0 10px; font-size: 13px;"><strong>Logistics Partner:</strong> ${shipment.provider}</p>
          <p style="margin: 0 0 10px; font-size: 14px;"><strong>AWB Tracking Number:</strong> <span style="font-family: monospace; color: #641B32; font-weight: bold;">${shipment.awbNumber}</span></p>
          <p style="margin: 0; font-size: 13px;"><strong>Estimated Arrival:</strong> ${new Date(shipment.estimatedDelivery).toLocaleDateString('en-IN')}</p>
        </div>
      </div>
    </div>
  `;

  try {
    const info = await mailer.sendMail({
      from: EMAIL_FROM,
      to: order.shippingEmail,
      subject: `Dispatched: Order ${order.orderNumber} is on its way via ${shipment.provider}`,
      html,
    });
    return info;
  } catch (err) {
    console.warn('Failed to send shipping email:', err.message);
  }
};

module.exports = {
  sendOrderConfirmation,
  sendShippingDispatch,
};
