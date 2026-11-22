const adminProductService = require('../services/adminProductService');
const { catchAsync } = require('../middleware/errorHandler');

const listProducts = catchAsync(async (req, res) => {
  const result = await adminProductService.listProducts(req.query);
  res.json({
    success: true,
    data: result.products,
    pagination: result.pagination,
  });
});

const getProductById = catchAsync(async (req, res) => {
  const product = await adminProductService.getProductById(req.params.id);
  res.json({
    success: true,
    data: product,
  });
});

const createProduct = catchAsync(async (req, res) => {
  const product = await adminProductService.createProduct(req.body, req.user.id);
  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    data: product,
  });
});

const updateProduct = catchAsync(async (req, res) => {
  const product = await adminProductService.updateProduct(req.params.id, req.body, req.user.id);
  res.json({
    success: true,
    message: 'Product updated successfully',
    data: product,
  });
});

const duplicateProduct = catchAsync(async (req, res) => {
  const product = await adminProductService.duplicateProduct(req.params.id, req.user.id);
  res.status(201).json({
    success: true,
    message: 'Product duplicated successfully',
    data: product,
  });
});

const deleteProduct = catchAsync(async (req, res) => {
  const result = await adminProductService.deleteProduct(req.params.id, req.user.id);
  res.json({
    success: true,
    message: result.message,
  });
});

const adjustStock = catchAsync(async (req, res) => {
  const { quantity, reason } = req.body;
  const product = await adminProductService.adjustStock(
    req.params.id,
    quantity,
    reason,
    req.user.id
  );
  res.json({
    success: true,
    message: 'Stock adjusted successfully',
    data: product,
  });
});

module.exports = {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  duplicateProduct,
  deleteProduct,
  adjustStock,
};
