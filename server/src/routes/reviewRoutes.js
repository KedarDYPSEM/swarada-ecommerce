const express = require('express');
const reviewController = require('../controllers/reviewController');
const { authenticate } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

// Public product reviews
router.get('/:productId/reviews', reviewController.getProductReviews);

// Customer submits review (authenticated)
router.post('/:productId/reviews', authenticate, reviewController.createReview);

module.exports = router;
