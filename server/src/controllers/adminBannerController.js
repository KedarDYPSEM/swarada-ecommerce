const adminBannerService = require('../services/adminBannerService');
const { catchAsync } = require('../middleware/errorHandler');

const listBanners = catchAsync(async (req, res) => {
  const banners = await adminBannerService.listBanners();
  res.json({
    success: true,
    data: banners,
  });
});

const createBanner = catchAsync(async (req, res) => {
  const banner = await adminBannerService.createBanner(req.body);
  res.status(201).json({
    success: true,
    message: 'Banner created successfully',
    data: banner,
  });
});

const updateBanner = catchAsync(async (req, res) => {
  const banner = await adminBannerService.updateBanner(req.params.id, req.body);
  res.json({
    success: true,
    message: 'Banner updated successfully',
    data: banner,
  });
});

const deleteBanner = catchAsync(async (req, res) => {
  await adminBannerService.deleteBanner(req.params.id);
  res.json({
    success: true,
    message: 'Banner deleted successfully',
  });
});

module.exports = {
  listBanners,
  createBanner,
  updateBanner,
  deleteBanner,
};
