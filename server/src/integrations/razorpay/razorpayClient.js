const Razorpay = require('razorpay');

const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_swarada2026';
const keySecret = process.env.RAZORPAY_KEY_SECRET || 'swarada_test_secret_key_12345';
const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'swarada_webhook_secret_12345';

let razorpayInstance = null;

try {
  razorpayInstance = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
} catch (err) {
  console.warn('⚠️ Razorpay client initialization warning:', err.message);
}

module.exports = {
  razorpay: razorpayInstance,
  keyId,
  keySecret,
  webhookSecret,
};
