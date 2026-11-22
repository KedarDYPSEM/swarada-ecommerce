const adminCategoryService = require('../services/adminCategoryService');
const { catchAsync } = require('../middleware/errorHandler');

const listCategories = catchAsync(async (req, res) => {
  const categories = await adminCategoryService.listCategories();
  res.json({
    success: true,
    data: categories,
  });
});

const createCategory = catchAsync(async (req, res) => {
  const category = await adminCategoryService.createCategory(req.body);
  res.status(201).json({
    success: true,
    message: 'Category created successfully',
    data: category,
  });
});

const updateCategory = catchAsync(async (req, res) => {
  const category = await adminCategoryService.updateCategory(req.params.id, req.body);
  res.json({
    success: true,
    message: 'Category updated successfully',
    data: category,
  });
});

const deleteCategory = catchAsync(async (req, res) => {
  await adminCategoryService.deleteCategory(req.params.id);
  res.json({
    success: true,
    message: 'Category deleted successfully',
  });
});

module.exports = {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
