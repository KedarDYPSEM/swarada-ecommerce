const productService = require('../services/productService');

/**
 * List products with filtering, sorting and pagination
 */
const getProducts = async (req, res, next) => {
  try {
    const result = await productService.getProducts(req.query);
    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get product by slug
 */
const getProductBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const result = await productService.getProductBySlug(slug);
    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Search products (autocomplete / instant SKU search)
 */
const searchProducts = async (req, res, next) => {
  try {
    const { q, limit } = req.query;
    const results = await productService.searchProducts(q, limit ? parseInt(limit, 10) : 8);
    res.status(200).json({
      status: 'success',
      data: { products: results },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get available filter options (fabrics, colours, price range)
 */
const getFilterOptions = async (req, res, next) => {
  try {
    const filters = await productService.getFilterOptions();
    res.status(200).json({
      status: 'success',
      data: { filters },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProducts,
  getProductBySlug,
  searchProducts,
  getFilterOptions,
};
