const express = require('express');
const reviewController = require('../controllers/reviewController');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

// Public product reviews
router.get('/:productId/reviews', reviewController.getProductReviews);

// Customer or guest submits review
router.post('/:productId/reviews', optionalAuth, reviewController.createReview);

module.exports = router;
