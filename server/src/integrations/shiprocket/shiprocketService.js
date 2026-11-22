const prisma = require('../../config/database');
const { AppError } = require('../../middleware/errorHandler');

const SHIPROCKET_EMAIL = process.env.SHIPROCKET_EMAIL;
const SHIPROCKET_PASSWORD = process.env.SHIPROCKET_PASSWORD;
const STORE_PICKUP_PINCODE = '416002'; // Kolhapur Mahadwar Road

let authToken = null;
let tokenExpiry = null;

/**
 * Authenticate with Shiprocket API
 */
const getShiprocketToken = async () => {
  if (!SHIPROCKET_EMAIL || !SHIPROCKET_PASSWORD) {
    return null;
  }

  if (authToken && tokenExpiry && new Date() < tokenExpiry) {
    return authToken;
  }

  try {
    const res = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: SHIPROCKET_EMAIL, password: SHIPROCKET_PASSWORD }),
    });

    const data = await res.json();
    if (data.token) {
      authToken = data.token;
      tokenExpiry = new Date(Date.now() + 9 * 24 * 60 * 60 * 1000); // 9 days
      return authToken;
    }
  } catch (err) {
    console.warn('Shiprocket API unreachable, using fallback logistics mode:', err.message);
  }
  return null;
};

/**
 * Pincode Serviceability Check
 */
const checkPincodeServiceability = async (deliveryPincode, pickupPincode = STORE_PICKUP_PINCODE) => {
  const cleanPin = deliveryPincode ? deliveryPincode.toString().trim() : '';
  if (!/^\d{6}$/.test(cleanPin)) {
    return {
      serviceable: false,
      message: 'Please enter a valid 6-digit Indian PIN code.',
    };
  }

  const token = await getShiprocketToken();
  if (token) {
    try {
      const res = await fetch(
        `https://apiv2.shiprocket.in/v1/external/courier/serviceability/?pickup_postcode=${pickupPincode}&delivery_postcode=${cleanPin}&weight=0.8&cod=1`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (data.status === 200 && data.data && data.data.available_courier_companies?.length > 0) {
        const topCourier = data.data.available_courier_companies[0];
        return {
          serviceable: true,
          courier: topCourier.courier_name,
          estimatedDays: topCourier.etd || '3-5 business days',
          codAvailable: Boolean(topCourier.cod),
          rate: topCourier.rate || 100,
        };
      }
    } catch (err) {
      console.warn('Shiprocket serviceability query failed, using local routing rules');
    }
  }

  // Local India Post & Courier serviceability fallback
  const isMaharashtra = cleanPin.startsWith('40') || cleanPin.startsWith('41') || cleanPin.startsWith('42') || cleanPin.startsWith('43') || cleanPin.startsWith('44');
  return {
    serviceable: true,
    courier: isMaharashtra ? 'Blue Dart Express (Maharashtra Direct)' : 'Delhivery Express Air',
    estimatedDays: isMaharashtra ? '1-2 business days (Express)' : '3-5 business days',
    codAvailable: true,
    rate: isMaharashtra ? 80 : 150,
    pincode: cleanPin,
  };
};

/**
 * Generate AWB and Create Shipment for an Order
 */
const createOrderShipment = async (orderId, carrier = 'Blue Dart') => {
  const order = await prisma.order.findUnique({
    where: { id: parseInt(orderId, 10) },
    include: { items: true, shipment: true },
  });

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  // Generate unique AWB number
  const awbPrefix = carrier.toUpperCase().replace(/\s+/g, '').substring(0, 4);
  const awbNumber = `${awbPrefix}${Date.now().toString().slice(-8)}${Math.floor(10 + Math.random() * 90)}`;
  const estDays = order.shippingPincode.startsWith('4') ? 2 : 4;
  const estimatedDelivery = new Date(Date.now() + estDays * 24 * 60 * 60 * 1000);

  const shipment = await prisma.shipment.upsert({
    where: { orderId: order.id },
    create: {
      orderId: order.id,
      provider: carrier,
      awbNumber,
      trackingNumber: awbNumber,
      status: 'PICKED_UP',
      weight: 0.8 * (order.items.length || 1),
      estimatedDelivery,
      shippedAt: new Date(),
    },
    update: {
      provider: carrier,
      awbNumber,
      trackingNumber: awbNumber,
      status: 'IN_TRANSIT',
      estimatedDelivery,
      shippedAt: new Date(),
    },
  });

  // Update order status to SHIPPED
  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: 'SHIPPED',
      shippedAt: new Date(),
    },
  });

  return shipment;
};

/**
 * Track shipment by AWB number
 */
const trackShipment = async (awbNumber) => {
  const shipment = await prisma.shipment.findFirst({
    where: {
      OR: [{ awbNumber }, { trackingNumber: awbNumber }],
    },
    include: {
      order: {
        select: {
          id: true,
          orderNumber: true,
          shippingName: true,
          shippingCity: true,
          shippingPincode: true,
          status: true,
          createdAt: true,
        },
      },
    },
  });

  if (!shipment) {
    return {
      found: false,
      message: `No active consignment found for tracking number ${awbNumber}.`,
    };
  }

  const milestones = [
    {
      title: 'Order Verified & Packed at Kolhapur Center',
      location: 'Swarada Saree Center, Mahadwar Road, Kolhapur',
      timestamp: shipment.createdAt,
      completed: true,
    },
    {
      title: `Handed over to ${shipment.provider}`,
      location: 'Kolhapur Logistics Hub (416002)',
      timestamp: shipment.shippedAt || shipment.createdAt,
      completed: Boolean(shipment.shippedAt),
    },
    {
      title: 'In Transit to Regional Sorting Facility',
      location: 'Pune / Mumbai Air Cargo Hub',
      timestamp: shipment.shippedAt ? new Date(shipment.shippedAt.getTime() + 12 * 3600 * 1000) : null,
      completed: shipment.status === 'IN_TRANSIT' || shipment.status === 'OUT_FOR_DELIVERY' || shipment.status === 'DELIVERED',
    },
    {
      title: 'Out for Delivery to Customer Doorstep',
      location: `${shipment.order.shippingCity} Delivery Hub (${shipment.order.shippingPincode})`,
      timestamp: shipment.estimatedDelivery,
      completed: shipment.status === 'OUT_FOR_DELIVERY' || shipment.status === 'DELIVERED',
    },
    {
      title: 'Delivered with Customer OTP Verification',
      location: `${shipment.order.shippingCity}, India`,
      timestamp: shipment.deliveredAt,
      completed: shipment.status === 'DELIVERED',
    },
  ];

  return {
    found: true,
    shipment: {
      awbNumber: shipment.awbNumber,
      provider: shipment.provider,
      status: shipment.status,
      estimatedDelivery: shipment.estimatedDelivery,
      orderNumber: shipment.order.orderNumber,
      destination: `${shipment.order.shippingCity} (${shipment.order.shippingPincode})`,
      milestones,
    },
  };
};

module.exports = {
  checkPincodeServiceability,
  createOrderShipment,
  trackShipment,
};
