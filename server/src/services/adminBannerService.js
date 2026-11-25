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
    videoUrl,
    isVideo = false,
    showText = true,
    linkUrl,
    type = 'HERO',
    displayOrder = 0,
    isActive = true,
    startsAt,
    expiresAt,
  } = data;

  const resolvedImageUrl = (imageUrl && imageUrl.trim()) || (videoUrl && videoUrl.trim()) || '';
  if (!title || (!resolvedImageUrl && !videoUrl)) {
    throw new AppError('Banner title and media URL (image or video) are required.', 400);
  }

  return prisma.banner.create({
    data: {
      title: title.trim(),
      subtitle: subtitle ? subtitle.trim() : null,
      imageUrl: resolvedImageUrl,
      mobileImageUrl: mobileImageUrl ? mobileImageUrl.trim() : null,
      videoUrl: videoUrl ? videoUrl.trim() : null,
      isVideo: Boolean(isVideo),
      showText: showText !== undefined ? Boolean(showText) : true,
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
  if (data.videoUrl !== undefined) updateData.videoUrl = data.videoUrl ? data.videoUrl.trim() : null;
  if (data.isVideo !== undefined) updateData.isVideo = Boolean(data.isVideo);
  if (data.showText !== undefined) updateData.showText = Boolean(data.showText);
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
