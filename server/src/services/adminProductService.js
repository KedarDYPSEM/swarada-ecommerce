const prisma = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

/**
 * List products for Admin (Includes purchasePrice, inventory movements, status)
 */
const listProducts = async (query = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 15));
  const skip = (page - 1) * limit;

  const where = {};

  if (query.search) {
    const term = query.search.trim();
    where.OR = [
      { name: { contains: term } },
      { sku: { contains: term } },
      { barcode: { contains: term } },
      { fabric: { contains: term } },
    ];
  }

  if (query.category) {
    where.categories = {
      some: {
        category: {
          slug: query.category,
        },
      },
    };
  }

  if (query.status === 'active') {
    where.isActive = true;
  } else if (query.status === 'inactive') {
    where.isActive = false;
  }

  if (query.stock === 'low') {
    where.stockQuantity = { gt: 0, lte: 4 };
  } else if (query.stock === 'out') {
    where.stockQuantity = 0;
  }

  const [products, totalCount] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        images: { orderBy: { displayOrder: 'asc' } },
        categories: { include: { category: true } },
        inventory: true,
      },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    pagination: {
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    },
  };
};

/**
 * Get product by ID for admin edit
 */
const getProductById = async (id) => {
  const product = await prisma.product.findUnique({
    where: { id: parseInt(id, 10) },
    include: {
      images: { orderBy: { displayOrder: 'asc' } },
      categories: { include: { category: true } },
      attributes: true,
      variants: true,
      inventory: true,
      inventoryMovements: {
        take: 10,
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!product) {
    throw new AppError('Product not found.', 404);
  }

  return product;
};

/**
 * Create a new Product
 */
const createProduct = async (data, adminId) => {
  const {
    name,
    sku,
    barcode,
    description,
    shortDescription,
    mrp,
    sellingPrice,
    purchasePrice,
    gstRate,
    fabric,
    colour,
    sareeLength,
    blouseDetails,
    washingInstructions,
    stockQuantity = 0,
    lowStockThreshold = 4,
    isFeatured = false,
    isNewArrival = true,
    isBestSeller = false,
    isActive = true,
    categoryIds = [],
    images = [],
    attributes = [],
    variants = [],
  } = data;

  // Verify unique SKU
  const existingSku = await prisma.product.findUnique({ where: { sku: sku.trim() } });
  if (existingSku) {
    throw new AppError(`Product SKU "${sku}" already exists. SKU must be unique.`, 400);
  }

  // Sanitize and check unique barcode if provided
  const cleanBarcode = barcode && barcode.trim() !== '' ? barcode.trim() : null;
  if (cleanBarcode) {
    const existingBarcode = await prisma.product.findUnique({ where: { barcode: cleanBarcode } });
    if (existingBarcode) {
      throw new AppError(`Barcode "${cleanBarcode}" is already in use by product "${existingBarcode.name}".`, 400);
    }
  }

  const slug = name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 100) + `-${Date.now().toString(36)}`;

  const numStock = parseInt(stockQuantity, 10) || 0;

  return prisma.$transaction(async (tx) => {
    const product = await tx.product.create({
      data: {
        name,
        slug,
        sku: sku.trim(),
        barcode: cleanBarcode,
        description: description || null,
        shortDescription: shortDescription || null,
        mrp: parseFloat(mrp),
        sellingPrice: parseFloat(sellingPrice),
        purchasePrice: purchasePrice ? parseFloat(purchasePrice) : null,
        gstRate: gstRate ? parseFloat(gstRate) : 5.0,
        fabric: fabric || null,
        colour: colour || null,
        sareeLength: sareeLength || null,
        blouseDetails: blouseDetails || null,
        washingInstructions: washingInstructions || null,
        stockQuantity: numStock,
        lowStockThreshold: parseInt(lowStockThreshold, 10) || 4,
        isFeatured: Boolean(isFeatured),
        isNewArrival: Boolean(isNewArrival),
        isBestSeller: Boolean(isBestSeller),
        isActive: Boolean(isActive),
        inventory: {
          create: {
            quantity: numStock,
            reservedQuantity: 0,
            lastRestockAt: new Date(),
          },
        },
        inventoryMovements: {
          create: {
            movementType: 'STOCK_IN',
            quantity: numStock,
            balanceAfter: numStock,
            referenceType: 'INITIAL_STOCK',
            notes: 'Product created by administrator',
            createdById: adminId,
          },
        },
        categories: {
          create: categoryIds.map((catId) => ({ categoryId: parseInt(catId, 10) })),
        },
        images: {
          create: images.map((img, idx) => ({
            url: typeof img === 'string' ? img : img.url,
            altText: typeof img === 'string' ? name : img.altText || name,
            displayOrder: idx + 1,
            isPrimary: idx === 0,
          })),
        },
        attributes: {
          create: attributes.map((attr) => ({
            name: attr.name,
            value: attr.value,
          })),
        },
        variants: variants && variants.length > 0 ? {
          create: variants
            .filter((v) => (v.variantValue && v.variantValue.trim()) || (v.colorName && v.colorName.trim()) || v.imageUrl)
            .map((v, idx) => ({
              variantName: v.variantName || 'Color',
              variantValue: (v.variantValue || v.colorName || `Color ${idx + 1}`).trim(),
              colorCode: v.colorCode || null,
              imageUrl: v.imageUrl || null,
              sku: (v.sku && v.sku.trim()) || `${sku.trim()}-CLR${idx + 1}`,
              priceAdjustment: v.priceAdjustment ? parseFloat(v.priceAdjustment) : 0.00,
              stockQuantity: v.stockQuantity !== undefined ? parseInt(v.stockQuantity, 10) : numStock,
              isActive: v.isActive !== undefined ? Boolean(v.isActive) : true,
            })),
        } : undefined,
      },
      include: {
        images: true,
        categories: { include: { category: true } },
        variants: true,
      },
    });

    return product;
  });
};

/**
 * Update product
 */
const updateProduct = async (id, data, adminId) => {
  const productId = parseInt(id, 10);
  const existing = await prisma.product.findUnique({ where: { id: productId } });
  if (!existing) {
    throw new AppError('Product not found.', 404);
  }

  const {
    name,
    sku,
    barcode,
    description,
    shortDescription,
    mrp,
    sellingPrice,
    purchasePrice,
    gstRate,
    fabric,
    colour,
    sareeLength,
    blouseDetails,
    washingInstructions,
    stockQuantity,
    lowStockThreshold,
    isFeatured,
    isNewArrival,
    isBestSeller,
    isActive,
    categoryIds,
    images,
    variants,
  } = data;

  if (sku && sku !== existing.sku) {
    const duplicate = await prisma.product.findUnique({ where: { sku: sku.trim() } });
    if (duplicate) {
      throw new AppError(`SKU "${sku}" is already in use by another saree.`, 400);
    }
  }

  // Sanitize and check unique barcode if provided
  const cleanBarcode = barcode !== undefined ? (barcode && barcode.trim() !== '' ? barcode.trim() : null) : undefined;
  if (cleanBarcode) {
    const duplicateBarcode = await prisma.product.findFirst({
      where: {
        barcode: cleanBarcode,
        NOT: { id: productId },
      },
    });
    if (duplicateBarcode) {
      throw new AppError(`Barcode "${cleanBarcode}" is already in use by product "${duplicateBarcode.name}".`, 400);
    }
  }

  return prisma.$transaction(async (tx) => {
    // Check if stock was adjusted manually
    if (stockQuantity !== undefined && parseInt(stockQuantity, 10) !== existing.stockQuantity) {
      const newStock = parseInt(stockQuantity, 10);
      const delta = newStock - existing.stockQuantity;

      await tx.inventoryMovement.create({
        data: {
          productId,
          movementType: delta >= 0 ? 'STOCK_IN' : 'ADJUSTMENT',
          quantity: delta,
          balanceAfter: newStock,
          referenceType: 'MANUAL_ADJUSTMENT',
          notes: `Stock updated by administrator from ${existing.stockQuantity} to ${newStock}`,
          createdById: adminId,
        },
      });

      await tx.inventory.updateMany({
        where: { productId },
        data: { quantity: newStock },
      });
    }

    // Update categories if provided
    if (categoryIds) {
      await tx.productCategory.deleteMany({ where: { productId } });
      await tx.productCategory.createMany({
        data: categoryIds.map((catId) => ({
          productId,
          categoryId: parseInt(catId, 10),
        })),
      });
    }

    // Update images if provided
    if (images && images.length > 0) {
      await tx.productImage.deleteMany({ where: { productId } });
      await tx.productImage.createMany({
        data: images.map((img, idx) => ({
          productId,
          url: typeof img === 'string' ? img : img.url,
          altText: typeof img === 'string' ? name || existing.name : img.altText,
          displayOrder: idx + 1,
          isPrimary: idx === 0,
        })),
      });
    }

    // Update variants if provided
    if (variants !== undefined) {
      await tx.productVariant.deleteMany({ where: { productId } });
      if (Array.isArray(variants) && variants.length > 0) {
        const validVariants = variants.filter(
          (v) => (v.variantValue && v.variantValue.trim()) || (v.colorName && v.colorName.trim()) || v.imageUrl
        );
        if (validVariants.length > 0) {
          const baseSku = (sku ? sku.trim() : existing.sku) || `SW${productId}`;
          await tx.productVariant.createMany({
            data: validVariants.map((v, idx) => ({
              productId,
              variantName: v.variantName || 'Color',
              variantValue: (v.variantValue || v.colorName || `Color ${idx + 1}`).trim(),
              colorCode: v.colorCode || null,
              imageUrl: v.imageUrl || null,
              sku: (v.sku && v.sku.trim()) || `${baseSku}-CLR${idx + 1}-${Date.now().toString(36).slice(-3)}`,
              priceAdjustment: v.priceAdjustment ? parseFloat(v.priceAdjustment) : 0.00,
              stockQuantity: v.stockQuantity !== undefined ? parseInt(v.stockQuantity, 10) : (stockQuantity !== undefined ? parseInt(stockQuantity, 10) : existing.stockQuantity),
              isActive: v.isActive !== undefined ? Boolean(v.isActive) : true,
            })),
          });
        }
      }
    }

    const updated = await tx.product.update({
      where: { id: productId },
      data: {
        name: name !== undefined ? name : undefined,
        sku: sku ? sku.trim() : undefined,
        barcode: cleanBarcode,
        description: description !== undefined ? description : undefined,
        shortDescription: shortDescription !== undefined ? shortDescription : undefined,
        mrp: mrp !== undefined ? parseFloat(mrp) : undefined,
        sellingPrice: sellingPrice !== undefined ? parseFloat(sellingPrice) : undefined,
        purchasePrice: purchasePrice !== undefined ? parseFloat(purchasePrice) : undefined,
        gstRate: gstRate !== undefined ? parseFloat(gstRate) : undefined,
        fabric: fabric !== undefined ? fabric : undefined,
        colour: colour !== undefined ? colour : undefined,
        sareeLength: sareeLength !== undefined ? sareeLength : undefined,
        blouseDetails: blouseDetails !== undefined ? blouseDetails : undefined,
        washingInstructions: washingInstructions !== undefined ? washingInstructions : undefined,
        stockQuantity: stockQuantity !== undefined ? parseInt(stockQuantity, 10) : undefined,
        lowStockThreshold: lowStockThreshold !== undefined ? parseInt(lowStockThreshold, 10) : undefined,
        isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : undefined,
        isNewArrival: isNewArrival !== undefined ? Boolean(isNewArrival) : undefined,
        isBestSeller: isBestSeller !== undefined ? Boolean(isBestSeller) : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
      },
      include: {
        images: true,
        categories: { include: { category: true } },
        variants: true,
      },
    });

    return updated;
  });
};

/**
 * Delete product
 */
const deleteProduct = async (id) => {
  const productId = parseInt(id, 10);
  return prisma.product.delete({
    where: { id: productId },
  });
};

/**
 * Duplicate an existing product
 */
const duplicateProduct = async (id, adminId) => {
  const original = await getProductById(id);

  const newSku = `${original.sku}-COPY-${Math.floor(Math.random() * 1000)}`;
  const newName = `${original.name} (Copy)`;

  return createProduct(
    {
      name: newName,
      sku: newSku,
      barcode: null,
      description: original.description,
      shortDescription: original.shortDescription,
      mrp: original.mrp,
      sellingPrice: original.sellingPrice,
      purchasePrice: original.purchasePrice,
      gstRate: original.gstRate,
      fabric: original.fabric,
      colour: original.colour,
      sareeLength: original.sareeLength,
      blouseDetails: original.blouseDetails,
      washingInstructions: original.washingInstructions,
      stockQuantity: original.stockQuantity,
      lowStockThreshold: original.lowStockThreshold,
      isFeatured: false,
      isNewArrival: true,
      isBestSeller: false,
      isActive: false, // Start as draft/inactive
      categoryIds: original.categories.map((c) => c.categoryId),
      images: original.images.map((img) => img.url),
      attributes: original.attributes.map((a) => ({ name: a.name, value: a.value })),
    },
    adminId
  );
};

module.exports = {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  duplicateProduct,
};
