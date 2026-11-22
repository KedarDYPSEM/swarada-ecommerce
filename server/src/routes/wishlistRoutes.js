const express = require('express');
const wishlistController = require('../controllers/wishlistController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', wishlistController.getWishlist);
router.post('/items', wishlistController.addToWishlist);
router.delete('/items/:productId', wishlistController.removeFromWishlist);

module.exports = router;
