const homepageService = require('../services/homepageService');

/**
 * Get aggregated homepage data
 */
const getHomepageData = async (req, res, next) => {
  try {
    const data = await homepageService.getHomepageData();
    res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
    res.status(200).json({
      status: 'success',
      data,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get public banners
 */
const getBanners = async (req, res, next) => {
  try {
    const { type } = req.query;
    const banners = await homepageService.getActiveBanners(type);
    res.status(200).json({
      status: 'success',
      data: { banners },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getHomepageData,
  getBanners,
};
