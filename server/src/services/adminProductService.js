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

  const resolvedColour = colour !== undefined && colour !== null ? colour : (data.color || null);

  const initialAttributes = [...(Array.isArray(attributes) ? attributes : [])];
  if (data.weaveType && !initialAttributes.some((a) => a.name === 'Weave Type' || a.name === 'Weave Technique')) {
    initialAttributes.push({ name: 'Weave Type', value: data.weaveType.trim() });
  }
  if (data.zariType && !initialAttributes.some((a) => a.name === 'Zari Quality' || a.name === 'Zari Type')) {
    initialAttributes.push({ name: 'Zari Quality', value: data.zariType.trim() });
  }
  if (data.occasion && !initialAttributes.some((a) => a.name === 'Occasion')) {
    initialAttributes.push({ name: 'Occasion', value: data.occasion.trim() });
  }
  if (data.isHandloom !== undefined && !initialAttributes.some((a) => a.name === 'Handloom Certified')) {
    initialAttributes.push({ name: 'Handloom Certified', value: data.isHandloom ? 'Yes (Authentic Handloom)' : 'Powerloom / Mill' });
  }

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

  const validVariants = (variants || []).filter(
    (v) => (v.variantValue && v.variantValue.trim()) || (v.colorName && v.colorName.trim()) || v.imageUrl
  );
  // Product quantity is equal to sum of variant quantity
  const numStock = validVariants.length > 0
    ? validVariants.reduce((sum, v) => sum + (parseInt(v.stockQuantity, 10) || 0), 0)
    : (parseInt(stockQuantity, 10) || 0);

  const parsedSellingPrice = parseFloat(sellingPrice);
  if (isNaN(parsedSellingPrice)) {
    throw new AppError('Selling price must be a valid number.', 400);
  }

  const parsedMrp = mrp !== undefined && mrp !== null && mrp !== '' && !isNaN(parseFloat(mrp))
    ? parseFloat(mrp)
    : parsedSellingPrice;

  const parsedPurchasePrice = purchasePrice !== undefined && purchasePrice !== null && purchasePrice !== '' && !isNaN(parseFloat(purchasePrice))
    ? parseFloat(purchasePrice)
    : null;

  const parsedGstRate = gstRate !== undefined && gstRate !== null && gstRate !== '' && !isNaN(parseFloat(gstRate))
    ? parseFloat(gstRate)
    : 5.0;

  const validCategoryIds = (Array.isArray(categoryIds) ? categoryIds : [])
    .map((id) => parseInt(id, 10))
    .filter((id) => !isNaN(id) && id > 0);

  const validImages = (Array.isArray(images) ? images : [])
    .filter((img) => img && (typeof img === 'string' ? img.trim() : (img.url && img.url.trim())))
    .map((img, idx) => ({
      url: typeof img === 'string' ? img.trim() : img.url.trim(),
      altText: typeof img === 'string' ? name : img.altText || name,
      displayOrder: idx + 1,
      isPrimary: idx === 0,
    }));

  const cleanAdminId = adminId ? parseInt(adminId, 10) || null : null;

  return prisma.$transaction(async (tx) => {
    const product = await tx.product.create({
      data: {
        name,
        slug,
        sku: sku.trim(),
        barcode: cleanBarcode,
        description: description || null,
        shortDescription: shortDescription || null,
        mrp: parsedMrp,
        sellingPrice: parsedSellingPrice,
        purchasePrice: parsedPurchasePrice,
        gstRate: parsedGstRate,
        fabric: fabric || null,
        colour: resolvedColour || null,
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
            createdById: cleanAdminId,
          },
        },
        categories: validCategoryIds.length > 0 ? {
          create: validCategoryIds.map((catId) => ({ categoryId: catId })),
        } : undefined,
        images: validImages.length > 0 ? {
          create: validImages,
        } : undefined,
        attributes: initialAttributes.length > 0 ? {
          create: initialAttributes.map((attr) => ({
            name: attr.name,
            value: attr.value,
          })),
        } : undefined,
        variants: validVariants.length > 0 ? {
          create: validVariants.map((v, idx) => ({
            variantName: v.variantName || 'Color',
            variantValue: (v.variantValue || v.colorName || `Color ${idx + 1}`).trim(),
            colorCode: v.colorCode || null,
            imageUrl: v.imageUrl || null,
            sku: (v.sku && v.sku.trim()) || `${sku.trim()}-CLR${idx + 1}`,
            priceAdjustment: v.priceAdjustment ? parseFloat(v.priceAdjustment) : 0.00,
            stockQuantity: v.stockQuantity !== undefined ? parseInt(v.stockQuantity, 10) || 0 : numStock,
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
    attributes,
  } = data;

  const resolvedUpdateColour =
    colour !== undefined ? colour : data.color !== undefined ? data.color : undefined;

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

    let finalStockQuantity = stockQuantity !== undefined ? parseInt(stockQuantity, 10) : existing.stockQuantity;

    // Update variants if provided
    if (variants !== undefined) {
      await tx.productVariant.deleteMany({ where: { productId } });
      if (Array.isArray(variants) && variants.length > 0) {
        const validVariants = variants.filter(
          (v) => (v.variantValue && v.variantValue.trim()) || (v.colorName && v.colorName.trim()) || v.imageUrl
        );
        if (validVariants.length > 0) {
          // Product quantity is equal to sum of variant quantity
          finalStockQuantity = validVariants.reduce((sum, v) => sum + (parseInt(v.stockQuantity, 10) || 0), 0);

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
              stockQuantity: parseInt(v.stockQuantity, 10) || 0,
              isActive: v.isActive !== undefined ? Boolean(v.isActive) : true,
            })),
          });
        }
      }
    }

    // Update attributes if provided
    const incomingAttributes = Array.isArray(attributes) ? [...attributes] : [];
    if (data.weaveType && !incomingAttributes.some((a) => a.name === 'Weave Type' || a.name === 'Weave Technique')) {
      incomingAttributes.push({ name: 'Weave Type', value: data.weaveType.trim() });
    }
    if (data.zariType && !incomingAttributes.some((a) => a.name === 'Zari Quality' || a.name === 'Zari Type')) {
      incomingAttributes.push({ name: 'Zari Quality', value: data.zariType.trim() });
    }
    if (data.occasion && !incomingAttributes.some((a) => a.name === 'Occasion')) {
      incomingAttributes.push({ name: 'Occasion', value: data.occasion.trim() });
    }
    if (data.isHandloom !== undefined && !incomingAttributes.some((a) => a.name === 'Handloom Certified')) {
      incomingAttributes.push({ name: 'Handloom Certified', value: data.isHandloom ? 'Yes (Authentic Handloom)' : 'Powerloom / Mill' });
    }

    if (attributes !== undefined || incomingAttributes.length > 0) {
      await tx.productAttribute.deleteMany({ where: { productId } });
      if (incomingAttributes.length > 0) {
        await tx.productAttribute.createMany({
          data: incomingAttributes
            .filter((a) => a && a.name && a.value)
            .map((attr) => ({
              productId,
              name: attr.name.trim(),
              value: attr.value.trim(),
            })),
        });
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
        colour: resolvedUpdateColour !== undefined ? resolvedUpdateColour : undefined,
        sareeLength: sareeLength !== undefined ? sareeLength : undefined,
        blouseDetails: blouseDetails !== undefined ? blouseDetails : undefined,
        washingInstructions: washingInstructions !== undefined ? washingInstructions : undefined,
        stockQuantity: finalStockQuantity,
        lowStockThreshold: lowStockThreshold !== undefined ? parseInt(lowStockThreshold, 10) : undefined,
        isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : undefined,
        isNewArrival: isNewArrival !== undefined ? Boolean(isNewArrival) : undefined,
        isBestSeller: isBestSeller !== undefined ? Boolean(isBestSeller) : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
      },
      include: {
        images: true,
        categories: { include: { category: true } },
        attributes: true,
        variants: true,
      },
    });

    await tx.inventory.updateMany({
      where: { productId },
      data: { quantity: finalStockQuantity },
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
