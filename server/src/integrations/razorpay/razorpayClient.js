const Razorpay = require('razorpay');
const prisma = require('../../config/database');

/**
 * Dynamically resolves Razorpay credentials from DB settings (Admin Panel) or .env fallback
 */
async function getRazorpayConfig() {
  let keyId = process.env.RAZORPAY_KEY_ID || '';
  let keySecret = process.env.RAZORPAY_KEY_SECRET || '';
  let webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
  let mode = 'test';

  try {
    const settings = await prisma.setting.findMany({
      where: {
        key: {
          in: ['razorpay_key_id', 'razorpay_key_secret', 'razorpay_webhook_secret', 'razorpay_mode'],
        },
      },
    });

    const map = {};
    settings.forEach((s) => {
      map[s.key] = s.value;
    });

    if (map.razorpay_key_id && map.razorpay_key_id.trim()) {
      keyId = map.razorpay_key_id.trim().replace(/^["']|["']$/g, '');
    }
    if (map.razorpay_key_secret && map.razorpay_key_secret.trim()) {
      keySecret = map.razorpay_key_secret.trim().replace(/^["']|["']$/g, '');
    }
    if (map.razorpay_webhook_secret && map.razorpay_webhook_secret.trim()) {
      webhookSecret = map.razorpay_webhook_secret.trim().replace(/^["']|["']$/g, '');
    }
    if (map.razorpay_mode) {
      mode = map.razorpay_mode;
    }
  } catch (err) {
    console.warn('⚠️ Could not query settings for Razorpay config:', err.message);
  }

  // Check if real key is configured
  const hasDbKey = Boolean(keyId && !keyId.includes('placeholder') && keyId.startsWith('rzp_'));
  const hasEnvKey = Boolean(
    process.env.RAZORPAY_KEY_ID &&
    !process.env.RAZORPAY_KEY_ID.includes('placeholder') &&
    process.env.RAZORPAY_KEY_ID.startsWith('rzp_')
  );

  if (!hasDbKey) {
    if (hasEnvKey) {
      keyId = process.env.RAZORPAY_KEY_ID.trim();
      keySecret = process.env.RAZORPAY_KEY_SECRET ? process.env.RAZORPAY_KEY_SECRET.trim() : keySecret;
    } else {
      keyId = 'rzp_test_swarada2026';
      keySecret = 'swarada_test_secret_key_12345';
    }
  }

  let razorpayInstance = null;
  const isRealKey = keyId.startsWith('rzp_') && !keyId.includes('placeholder') && keyId !== 'rzp_test_swarada2026';

  if (isRealKey && keySecret && !keySecret.includes('placeholder')) {
    try {
      razorpayInstance = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });
    } catch (err) {
      console.warn('⚠️ Razorpay client instance creation error:', err.message);
    }
  }

  return {
    razorpay: razorpayInstance,
    keyId,
    keySecret,
    webhookSecret,
    mode,
    isRealKey,
  };
}

module.exports = {
  getRazorpayConfig,
  keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_swarada2026',
  keySecret: process.env.RAZORPAY_KEY_SECRET || 'swarada_test_secret_key_12345',
  webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || 'swarada_webhook_secret_12345',
};
