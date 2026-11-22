const wishlistService = require('../services/wishlistService');

const getWishlist = async (req, res, next) => {
  try {
    const items = await wishlistService.getWishlist(req.user.id);
    res.status(200).json({
      status: 'success',
      data: { items },
    });
  } catch (err) {
    next(err);
  }
};

const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const items = await wishlistService.addToWishlist(req.user.id, parseInt(productId, 10));
    res.status(200).json({
      status: 'success',
      message: 'Added to your wishlist.',
      data: { items },
    });
  } catch (err) {
    next(err);
  }
};

const removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const items = await wishlistService.removeFromWishlist(req.user.id, parseInt(productId, 10));
    res.status(200).json({
      status: 'success',
      message: 'Removed from your wishlist.',
      data: { items },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};
