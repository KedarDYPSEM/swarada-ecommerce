const shiprocketService = require('../integrations/shiprocket/shiprocketService');
const { catchAsync } = require('../middleware/errorHandler');

/**
 * Check Pincode Serviceability
 */
const checkServiceability = catchAsync(async (req, res) => {
  const { pincode } = req.query;
  const result = await shiprocketService.checkPincodeServiceability(pincode);
  res.status(200).json({
    success: true,
    data: result,
  });
});

/**
 * Create Shipment AWB (Admin)
 */
const createShipment = catchAsync(async (req, res) => {
  const { orderId, carrier } = req.body;
  const shipment = await shiprocketService.createOrderShipment(orderId, carrier);
  res.status(201).json({
    success: true,
    message: 'Shipment created and AWB assigned',
    data: shipment,
  });
});

/**
 * Track Shipment by AWB
 */
const trackShipment = catchAsync(async (req, res) => {
  const { awb } = req.params;
  const tracking = await shiprocketService.trackShipment(awb);
  res.status(200).json({
    success: true,
    data: tracking,
  });
});

module.exports = {
  checkServiceability,
  createShipment,
  trackShipment,
};
