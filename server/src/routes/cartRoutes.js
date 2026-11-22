const express = require('express');
const cartController = require('../controllers/cartController');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Cart endpoints support both logged in users and guest checkout via optionalAuth
router.use(optionalAuth);

router.get('/', cartController.getCart);
router.post('/items', cartController.addItem);
router.put('/items/:id', cartController.updateItem);
router.delete('/items/:id', cartController.removeItem);

module.exports = router;
