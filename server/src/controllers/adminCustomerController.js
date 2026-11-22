const adminCustomerService = require('../services/adminCustomerService');
const { catchAsync } = require('../middleware/errorHandler');

const listCustomers = catchAsync(async (req, res) => {
  const result = await adminCustomerService.listCustomers(req.query);
  res.json({
    success: true,
    data: result.customers,
    pagination: result.pagination,
  });
});

const getCustomerById = catchAsync(async (req, res) => {
  const customer = await adminCustomerService.getCustomerById(req.params.id);
  res.json({
    success: true,
    data: customer,
  });
});

const updateCustomer = catchAsync(async (req, res) => {
  const updated = await adminCustomerService.updateCustomer(req.params.id, req.body);
  res.json({
    success: true,
    message: 'Customer updated successfully.',
    data: updated,
  });
});

const toggleCustomerStatus = catchAsync(async (req, res) => {
  const result = await adminCustomerService.toggleCustomerStatus(req.params.id);
  res.json({
    success: true,
    message: `Customer marked as ${result.isActive ? 'Active' : 'Inactive'}.`,
    data: result,
  });
});

module.exports = {
  listCustomers,
  getCustomerById,
  updateCustomer,
  toggleCustomerStatus,
};
