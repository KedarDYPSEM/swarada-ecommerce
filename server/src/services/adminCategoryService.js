const prisma = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

/**
 * List all categories for admin (including inactive ones)
 */
const listCategories = async () => {
  return prisma.category.findMany({
    orderBy: [{ parentId: 'asc' }, { displayOrder: 'asc' }],
    include: {
      parent: {
        select: { id: true, name: true, slug: true },
      },
      _count: {
        select: {
          children: true,
          productCategories: true,
        },
      },
    },
  });
};

/**
 * Create a new category
 */
const createCategory = async (data) => {
  const { name, slug, parentId, description, imageUrl, displayOrder = 0, isActive = true } = data;

  if (!name || !slug) {
    throw new AppError('Category name and slug are required.', 400);
  }

  const cleanSlug = slug.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
  const existing = await prisma.category.findUnique({ where: { slug: cleanSlug } });
  if (existing) {
    throw new AppError(`Category with slug "${cleanSlug}" already exists.`, 400);
  }

  return prisma.category.create({
    data: {
      name: name.trim(),
      slug: cleanSlug,
      parentId: parentId ? parseInt(parentId, 10) : null,
      description: description || null,
      imageUrl: imageUrl || null,
      displayOrder: parseInt(displayOrder, 10) || 0,
      isActive: Boolean(isActive),
    },
  });
};

/**
 * Update an existing category
 */
const updateCategory = async (id, data) => {
  const catId = parseInt(id, 10);
  const existing = await prisma.category.findUnique({ where: { id: catId } });
  if (!existing) {
    throw new AppError('Category not found.', 404);
  }

  const updateData = {};
  if (data.name !== undefined) updateData.name = data.name.trim();
  if (data.slug !== undefined) {
    const cleanSlug = data.slug.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
    if (cleanSlug !== existing.slug) {
      const slugExists = await prisma.category.findUnique({ where: { slug: cleanSlug } });
      if (slugExists) throw new AppError(`Slug "${cleanSlug}" is already in use.`, 400);
      updateData.slug = cleanSlug;
    }
  }
  if (data.parentId !== undefined) {
    updateData.parentId = data.parentId ? parseInt(data.parentId, 10) : null;
    if (updateData.parentId === catId) {
      throw new AppError('A category cannot be its own parent.', 400);
    }
  }
  if (data.description !== undefined) updateData.description = data.description || null;
  if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl || null;
  if (data.displayOrder !== undefined) updateData.displayOrder = parseInt(data.displayOrder, 10) || 0;
  if (data.isActive !== undefined) updateData.isActive = Boolean(data.isActive);

  return prisma.category.update({
    where: { id: catId },
    data: updateData,
  });
};

/**
 * Delete category
 */
const deleteCategory = async (id) => {
  const catId = parseInt(id, 10);
  const category = await prisma.category.findUnique({
    where: { id: catId },
    include: {
      _count: {
        select: { children: true, productCategories: true },
      },
    },
  });

  if (!category) {
    throw new AppError('Category not found.', 404);
  }

  if (category._count.children > 0) {
    throw new AppError('Cannot delete category with subcategories. Reassign or delete child categories first.', 400);
  }

  if (category._count.productCategories > 0) {
    throw new AppError('Cannot delete category assigned to products. Remove products from this category first.', 400);
  }

  return prisma.category.delete({ where: { id: catId } });
};

module.exports = {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
