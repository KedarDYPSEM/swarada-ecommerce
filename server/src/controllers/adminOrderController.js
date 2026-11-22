const adminOrderService = require('../services/adminOrderService');
const { catchAsync } = require('../middleware/errorHandler');

const listOrders = catchAsync(async (req, res) => {
  const result = await adminOrderService.listOrders(req.query);
  res.json({
    success: true,
    data: result.orders,
    pagination: result.pagination,
  });
});

const getOrderById = catchAsync(async (req, res) => {
  const order = await adminOrderService.getOrderById(req.params.id);
  res.json({
    success: true,
    data: order,
  });
});

const updateOrderStatus = catchAsync(async (req, res) => {
  const { status, note } = req.body;
  const order = await adminOrderService.updateOrderStatus(
    req.params.id,
    status,
    note,
    req.user.id
  );
  res.json({
    success: true,
    message: `Order status updated to ${status}`,
    data: order,
  });
});

const updateShipmentTracking = catchAsync(async (req, res) => {
  const shipment = await adminOrderService.updateShipmentTracking(req.params.id, req.body);
  res.json({
    success: true,
    message: 'Shipment tracking details saved successfully',
    data: shipment,
  });
});

const cancelOrder = catchAsync(async (req, res) => {
  const { reason } = req.body;
  const order = await adminOrderService.cancelOrderByAdmin(
    req.params.id,
    reason,
    req.user.id
  );
  res.json({
    success: true,
    message: 'Order cancelled and stock restored to inventory',
    data: order,
  });
});

module.exports = {
  listOrders,
  getOrderById,
  updateOrderStatus,
  updateShipmentTracking,
  cancelOrder,
};
