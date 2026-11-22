const prisma = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

/**
 * List all banners for admin
 */
const listBanners = async () => {
  return prisma.banner.findMany({
    orderBy: [{ type: 'asc' }, { displayOrder: 'asc' }],
  });
};

/**
 * Create a banner
 */
const createBanner = async (data) => {
  const {
    title,
    subtitle,
    imageUrl,
    mobileImageUrl,
    linkUrl,
    type = 'HERO',
    displayOrder = 0,
    isActive = true,
    startsAt,
    expiresAt,
  } = data;

  if (!title || !imageUrl) {
    throw new AppError('Banner title and image URL are required.', 400);
  }

  return prisma.banner.create({
    data: {
      title: title.trim(),
      subtitle: subtitle ? subtitle.trim() : null,
      imageUrl: imageUrl.trim(),
      mobileImageUrl: mobileImageUrl ? mobileImageUrl.trim() : null,
      linkUrl: linkUrl ? linkUrl.trim() : null,
      type,
      displayOrder: parseInt(displayOrder, 10) || 0,
      isActive: Boolean(isActive),
      startsAt: startsAt ? new Date(startsAt) : null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    },
  });
};

/**
 * Update banner
 */
const updateBanner = async (id, data) => {
  const bannerId = parseInt(id, 10);
  const existing = await prisma.banner.findUnique({ where: { id: bannerId } });
  if (!existing) {
    throw new AppError('Banner not found.', 404);
  }

  const updateData = {};
  if (data.title !== undefined) updateData.title = data.title.trim();
  if (data.subtitle !== undefined) updateData.subtitle = data.subtitle ? data.subtitle.trim() : null;
  if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl.trim();
  if (data.mobileImageUrl !== undefined) updateData.mobileImageUrl = data.mobileImageUrl ? data.mobileImageUrl.trim() : null;
  if (data.linkUrl !== undefined) updateData.linkUrl = data.linkUrl ? data.linkUrl.trim() : null;
  if (data.type !== undefined) updateData.type = data.type;
  if (data.displayOrder !== undefined) updateData.displayOrder = parseInt(data.displayOrder, 10) || 0;
  if (data.isActive !== undefined) updateData.isActive = Boolean(data.isActive);
  if (data.startsAt !== undefined) updateData.startsAt = data.startsAt ? new Date(data.startsAt) : null;
  if (data.expiresAt !== undefined) updateData.expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;

  return prisma.banner.update({
    where: { id: bannerId },
    data: updateData,
  });
};

/**
 * Delete banner
 */
const deleteBanner = async (id) => {
  const bannerId = parseInt(id, 10);
  const existing = await prisma.banner.findUnique({ where: { id: bannerId } });
  if (!existing) {
    throw new AppError('Banner not found.', 404);
  }

  return prisma.banner.delete({ where: { id: bannerId } });
};

module.exports = {
  listBanners,
  createBanner,
  updateBanner,
  deleteBanner,
};
