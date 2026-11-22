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

module.exports = {
  listCustomers,
  getCustomerById,
};
