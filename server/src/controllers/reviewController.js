const reviewService = require('../services/reviewService');
const { catchAsync } = require('../middleware/errorHandler');

const getProductReviews = catchAsync(async (req, res) => {
  const result = await reviewService.getProductReviews(req.params.productId);
  res.status(200).json({
    success: true,
    data: result,
  });
});

const createReview = catchAsync(async (req, res) => {
  const review = await reviewService.createReview(
    req.params.productId,
    req.user ? req.user.id : null,
    req.body
  );
  res.status(201).json({
    success: true,
    message: 'Review submitted successfully! Thank you for your feedback.',
    data: review,
  });
});

const listAdminReviews = catchAsync(async (req, res) => {
  const reviews = await reviewService.listAdminReviews(req.query);
  res.status(200).json({
    success: true,
    data: reviews,
  });
});

const toggleApproval = catchAsync(async (req, res) => {
  const { isApproved } = req.body;
  const review = await reviewService.toggleReviewApproval(req.params.id, isApproved);
  res.status(200).json({
    success: true,
    message: `Review ${isApproved ? 'approved' : 'hidden'}`,
    data: review,
  });
});

const deleteReview = catchAsync(async (req, res) => {
  await reviewService.deleteReview(req.params.id);
  res.status(200).json({
    success: true,
    message: 'Review deleted successfully',
  });
});

module.exports = {
  getProductReviews,
  createReview,
  listAdminReviews,
  toggleApproval,
  deleteReview,
};
