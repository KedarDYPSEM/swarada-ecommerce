const prisma = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

/**
 * Get paginated, filtered, and sorted products
 */
const getProducts = async (query = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 12));
  const skip = (page - 1) * limit;

  const where = {
    isActive: true,
  };

  // 1. Category Filter (by slug)
  if (query.category) {
    where.categories = {
      some: {
        category: {
          slug: query.category,
        },
      },
    };
  }

  // 2. Search Filter (Name, SKU, Fabric, Colour, Description)
  if (query.search) {
    const term = query.search.trim();
    where.OR = [
      { name: { contains: term } },
      { sku: { contains: term } },
      { barcode: { contains: term } },
      { fabric: { contains: term } },
      { colour: { contains: term } },
      { description: { contains: term } },
    ];
  }

  // 3. Price Filter
  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    where.sellingPrice = {};
    if (query.minPrice !== undefined && query.minPrice !== '') {
      where.sellingPrice.gte = parseFloat(query.minPrice);
    }
    if (query.maxPrice !== undefined && query.maxPrice !== '') {
      where.sellingPrice.lte = parseFloat(query.maxPrice);
    }
  }

  // 4. Fabric Filter
  if (query.fabric) {
    const fabrics = Array.isArray(query.fabric) ? query.fabric : [query.fabric];
    where.fabric = { in: fabrics };
  }

  // 5. Colour Filter
  if (query.colour) {
    const colours = Array.isArray(query.colour) ? query.colour : [query.colour];
    where.colour = { in: colours };
  }

  // 6. Stock Availability Filter
  if (query.inStock === 'true' || query.inStock === true) {
    where.stockQuantity = { gt: 0 };
  }

  // 7. Flags (Featured, New Arrival, Best Seller)
  if (query.isFeatured === 'true' || query.isFeatured === true) {
    where.isFeatured = true;
  }
  if (query.isNewArrival === 'true' || query.isNewArrival === true) {
    where.isNewArrival = true;
  }
  if (query.isBestSeller === 'true' || query.isBestSeller === true) {
    where.isBestSeller = true;
  }

  // 8. Sorting
  let orderBy = { createdAt: 'desc' }; // default: newest
  if (query.sort === 'price-low') {
    orderBy = { sellingPrice: 'asc' };
  } else if (query.sort === 'price-high') {
    orderBy = { sellingPrice: 'desc' };
  } else if (query.sort === 'name-asc') {
    orderBy = { name: 'asc' };
  } else if (query.sort === 'popular') {
    orderBy = { isBestSeller: 'desc' };
  }

  // Execute query and total count in parallel
  const [products, totalCount] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        images: {
          orderBy: { displayOrder: 'asc' },
        },
        categories: {
          include: {
            category: {
              select: { id: true, name: true, slug: true },
            },
          },
        },
      },
    }),
    prisma.product.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return {
    products,
    pagination: {
      total: totalCount,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
};

/**
 * Get single product by slug with full associations
 */
const getProductBySlug = async (slug) => {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: {
        orderBy: { displayOrder: 'asc' },
      },
      categories: {
        include: {
          category: true,
        },
      },
      attributes: true,
      variants: {
        where: { isActive: true },
      },
      inventory: true,
      reviews: {
        where: { isApproved: true },
        include: {
          user: {
            select: {
              profile: {
                select: { firstName: true, lastName: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!product || !product.isActive) {
    throw new AppError('Product not found or currently unavailable.', 404);
  }

  // Fetch related products from same primary category
  const primaryCategoryId = product.categories[0]?.categoryId;
  let relatedProducts = [];
  if (primaryCategoryId) {
    relatedProducts = await prisma.product.findMany({
      where: {
        isActive: true,
        id: { not: product.id },
        categories: {
          some: { categoryId: primaryCategoryId },
        },
      },
      take: 4,
      include: {
        images: {
          orderBy: { displayOrder: 'asc' },
        },
      },
    });
  }

  return { product, relatedProducts };
};

/**
 * Autocomplete / Quick Search (Instant SKU & name match)
 */
const searchProducts = async (term, limit = 8) => {
  if (!term || !term.trim()) return [];

  const cleanTerm = term.trim();

  // First check exact or prefix SKU match (e.g. S7B3)
  const skuMatches = await prisma.product.findMany({
    where: {
      isActive: true,
      sku: { contains: cleanTerm },
    },
    take: limit,
    include: {
      images: { where: { isPrimary: true } },
      categories: { include: { category: true } },
    },
  });

  // If SKU matches exist, return them immediately
  if (skuMatches.length >= limit) {
    return skuMatches;
  }

  // Otherwise search across name, fabric, and categories
  const otherMatches = await prisma.product.findMany({
    where: {
      isActive: true,
      id: { notIn: skuMatches.map((p) => p.id) },
      OR: [
        { name: { contains: cleanTerm } },
        { fabric: { contains: cleanTerm } },
        { colour: { contains: cleanTerm } },
        {
          categories: {
            some: {
              category: {
                name: { contains: cleanTerm },
              },
            },
          },
        },
      ],
    },
    take: limit - skuMatches.length,
    include: {
      images: { where: { isPrimary: true } },
      categories: { include: { category: true } },
    },
  });

  return [...skuMatches, ...otherMatches];
};

/**
 * Get distinct filter options (available fabrics, colours, price range)
 */
const getFilterOptions = async () => {
  const [fabrics, colours, minMaxPrice] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true, fabric: { not: null } },
      select: { fabric: true },
      distinct: ['fabric'],
    }),
    prisma.product.findMany({
      where: { isActive: true, colour: { not: null } },
      select: { colour: true },
      distinct: ['colour'],
    }),
    prisma.product.aggregate({
      where: { isActive: true },
      _min: { sellingPrice: true },
      _max: { sellingPrice: true },
    }),
  ]);

  return {
    fabrics: fabrics.map((f) => f.fabric).filter(Boolean),
    colours: colours.map((c) => c.colour).filter(Boolean),
    priceRange: {
      min: minMaxPrice._min.sellingPrice || 0,
      max: minMaxPrice._max.sellingPrice || 50000,
    },
  };
};

module.exports = {
  getProducts,
  getProductBySlug,
  searchProducts,
  getFilterOptions,
};
