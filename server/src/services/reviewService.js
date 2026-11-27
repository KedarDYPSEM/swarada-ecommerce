const prisma = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

/**
 * Get approved reviews for a specific product
 */
const getProductReviews = async (productId) => {
  const pId = parseInt(productId, 10);

  const reviews = await prisma.productReview.findMany({
    where: {
      productId: pId,
      isApproved: true,
    },
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          id: true,
          profile: {
            select: {
              firstName: true,
              lastName: true,
              displayName: true,
              avatarUrl: true,
            },
          },
        },
      },
    },
  });

  const ratingAgg = await prisma.productReview.aggregate({
    where: { productId: pId, isApproved: true },
    _avg: { rating: true },
    _count: { rating: true },
  });

  return {
    reviews,
    averageRating: ratingAgg._avg.rating ? parseFloat(ratingAgg._avg.rating.toFixed(1)) : 5.0,
    totalReviews: ratingAgg._count.rating || 0,
  };
};

/**
 * Submit a customer or guest review
 */
const createReview = async (productId, userId, data) => {
  const pId = parseInt(productId, 10);
  const { rating, title, comment, name, email } = data;

  if (!rating || rating < 1 || rating > 5) {
    throw new AppError('Rating must be between 1 and 5 stars.', 400);
  }

  if (!comment || !comment.trim()) {
    throw new AppError('Review comment text is required.', 400);
  }

  // Check if product exists
  const product = await prisma.product.findUnique({ where: { id: pId } });
  if (!product) {
    throw new AppError('Product not found.', 404);
  }

  let reviewUserId = userId;
  if (!reviewUserId) {
    const reviewerName = (name || 'Customer').trim();
    const cleanEmail = email && email.trim() ? email.trim().toLowerCase() : `${Date.now()}@customer.swarada.com`;
    let user = await prisma.user.findFirst({
      where: { email: cleanEmail },
    });
    if (!user) {
      const nameParts = reviewerName.split(' ');
      user = await prisma.user.create({
        data: {
          email: cleanEmail,
          passwordHash: '$2a$10$dummyReviewerPasswordHashSwarada2026',
          role: 'CUSTOMER',
          profile: {
            create: {
              firstName: nameParts[0] || 'Customer',
              lastName: nameParts.slice(1).join(' ') || '',
              displayName: reviewerName,
            },
          },
        },
      });
    }
    reviewUserId = user.id;
  }

  // Check if user has an existing order for verified buyer tag
  const matchingOrder = await prisma.order.findFirst({
    where: {
      userId: reviewUserId,
      status: { in: ['CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED'] },
      items: { some: { productId: pId } },
    },
  });

  return prisma.productReview.create({
    data: {
      productId: pId,
      userId: reviewUserId,
      orderId: matchingOrder ? matchingOrder.id : null,
      rating: parseInt(rating, 10),
      title: title ? title.trim() : null,
      comment: comment.trim(),
      isApproved: true, // Auto-approved for instant visibility; admin can toggle/moderate in Admin -> Product Reviews
    },
    include: {
      user: {
        select: {
          id: true,
          profile: true,
        },
      },
      product: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};

/**
 * Admin: List all reviews with approval filters
 */
const listAdminReviews = async (query = {}) => {
  const where = {};
  if (query.status === 'approved') where.isApproved = true;
  if (query.status === 'pending') where.isApproved = false;

  return prisma.productReview.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      product: {
        select: { id: true, name: true, sku: true, images: { take: 1 } },
      },
      user: {
        select: {
          id: true,
          email: true,
          profile: { select: { firstName: true, lastName: true } },
        },
      },
    },
  });
};

/**
 * Admin: Toggle review approval status
 */
const toggleReviewApproval = async (reviewId, isApproved) => {
  const id = parseInt(reviewId, 10);
  return prisma.productReview.update({
    where: { id },
    data: { isApproved: Boolean(isApproved) },
  });
};

/**
 * Admin: Delete review
 */
const deleteReview = async (reviewId) => {
  const id = parseInt(reviewId, 10);
  return prisma.productReview.delete({ where: { id } });
};

module.exports = {
  getProductReviews,
  createReview,
  listAdminReviews,
  toggleReviewApproval,
  deleteReview,
};
