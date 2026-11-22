const prisma = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

/**
 * Get customer wishlist items
 */
const getWishlist = async (userId) => {
  let wishlist = await prisma.wishlist.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: { orderBy: { displayOrder: 'asc' } },
            },
          },
        },
      },
    },
  });

  if (!wishlist) {
    wishlist = await prisma.wishlist.create({
      data: { userId },
      include: {
        items: {
          include: {
            product: {
              include: { images: true },
            },
          },
        },
      },
    });
  }

  return wishlist.items.map((item) => ({
    id: item.id,
    addedAt: item.addedAt,
    product: item.product,
  }));
};

/**
 * Add product to wishlist
 */
const addToWishlist = async (userId, productId) => {
  let wishlist = await prisma.wishlist.findUnique({ where: { userId } });
  if (!wishlist) {
    wishlist = await prisma.wishlist.create({ data: { userId } });
  }

  const existing = await prisma.wishlistItem.findUnique({
    where: {
      wishlistId_productId: {
        wishlistId: wishlist.id,
        productId,
      },
    },
  });

  if (!existing) {
    await prisma.wishlistItem.create({
      data: {
        wishlistId: wishlist.id,
        productId,
      },
    });
  }

  return getWishlist(userId);
};

/**
 * Remove product from wishlist
 */
const removeFromWishlist = async (userId, productId) => {
  const wishlist = await prisma.wishlist.findUnique({ where: { userId } });
  if (wishlist) {
    await prisma.wishlistItem.deleteMany({
      where: {
        wishlistId: wishlist.id,
        productId,
      },
    });
  }

  return getWishlist(userId);
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};
