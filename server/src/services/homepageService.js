const prisma = require('../config/database');

/**
 * Get active banners by type (HERO, PROMOTIONAL, CATEGORY)
 */
const getActiveBanners = async (type = null) => {
  const where = { isActive: true };
  if (type) {
    where.type = type;
  }

  return prisma.banner.findMany({
    where,
    orderBy: { displayOrder: 'asc' },
  });
};

/**
 * Get aggregated data for the storefront homepage
 */
const getHomepageData = async () => {
  const [banners, categories, newArrivals, bestSellers, settings] = await Promise.all([
    prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    }),
    prisma.category.findMany({
      where: { isActive: true, parentId: null },
      orderBy: { displayOrder: 'asc' },
      take: 6,
    }),
    prisma.product.findMany({
      where: { isActive: true, isNewArrival: true },
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: {
        images: { orderBy: { displayOrder: 'asc' } },
        categories: { include: { category: true } },
      },
    }),
    prisma.product.findMany({
      where: { isActive: true, isBestSeller: true },
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: {
        images: { orderBy: { displayOrder: 'asc' } },
        categories: { include: { category: true } },
      },
    }),
    prisma.setting.findMany({
      where: {
        group: { in: ['general', 'shipping', 'storefront'] },
      },
    }),
  ]);

  // Transform settings array into a key-value object
  const settingsMap = {};
  settings.forEach((s) => {
    settingsMap[s.key] = s.value;
  });

  let resolvedNewArrivals = newArrivals;
  if (!resolvedNewArrivals || resolvedNewArrivals.length === 0) {
    resolvedNewArrivals = await prisma.product.findMany({
      where: { isActive: true },
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: {
        images: { orderBy: { displayOrder: 'asc' } },
        categories: { include: { category: true } },
      },
    });
  }

  let resolvedBestSellers = bestSellers;
  if (!resolvedBestSellers || resolvedBestSellers.length === 0) {
    resolvedBestSellers = await prisma.product.findMany({
      where: { isActive: true },
      take: 8,
      orderBy: { stockQuantity: 'desc' },
      include: {
        images: { orderBy: { displayOrder: 'asc' } },
        categories: { include: { category: true } },
      },
    });
  }

  return {
    banners: {
      hero: banners.filter((b) => b.type === 'HERO'),
      promotional: banners.filter((b) => b.type === 'PROMOTIONAL'),
      all: banners,
    },
    categories,
    newArrivals: resolvedNewArrivals,
    bestSellers: resolvedBestSellers,
    settings: settingsMap,
  };
};

module.exports = {
  getActiveBanners,
  getHomepageData,
};
