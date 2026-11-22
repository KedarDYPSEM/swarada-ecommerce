const prisma = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

/**
 * Get all active categories organized hierarchically (parents with children)
 */
const getCategories = async () => {
  const categories = await prisma.category.findMany({
    where: {
      isActive: true,
      parentId: null, // Top-level categories
    },
    orderBy: { displayOrder: 'asc' },
    include: {
      children: {
        where: { isActive: true },
        orderBy: { displayOrder: 'asc' },
        include: {
          _count: {
            select: { productCategories: true },
          },
        },
      },
      _count: {
        select: { productCategories: true },
      },
    },
  });

  return categories;
};

/**
 * Get category by slug
 */
const getCategoryBySlug = async (slug) => {
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      parent: true,
      children: {
        where: { isActive: true },
      },
      _count: {
        select: { productCategories: true },
      },
    },
  });

  if (!category || !category.isActive) {
    throw new AppError('Category not found.', 404);
  }

  return category;
};

module.exports = {
  getCategories,
  getCategoryBySlug,
};
