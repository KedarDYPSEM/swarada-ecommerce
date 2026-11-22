const express = require('express');
const productController = require('../controllers/productController');

const router = express.Router();

router.get('/', productController.getProducts);
router.get('/search', productController.searchProducts);
router.get('/filter-options', productController.getFilterOptions);
router.get('/:slug', productController.getProductBySlug);

module.exports = router;
