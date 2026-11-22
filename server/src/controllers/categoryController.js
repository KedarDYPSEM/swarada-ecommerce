const categoryService = require('../services/categoryService');

/**
 * List all categories hierarchically
 */
const getCategories = async (req, res, next) => {
  try {
    const categories = await categoryService.getCategories();
    res.status(200).json({
      status: 'success',
      data: { categories },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get category by slug
 */
const getCategoryBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const category = await categoryService.getCategoryBySlug(slug);
    res.status(200).json({
      status: 'success',
      data: { category },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCategories,
  getCategoryBySlug,
};
