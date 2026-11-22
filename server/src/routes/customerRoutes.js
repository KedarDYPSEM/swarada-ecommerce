const express = require('express');
const customerController = require('../controllers/customerController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/addresses', customerController.getAddresses);
router.post('/addresses', customerController.addAddress);
router.put('/addresses/:id', customerController.updateAddress);
router.patch('/addresses/:id/default', customerController.setDefaultAddress);
router.delete('/addresses/:id', customerController.deleteAddress);

module.exports = router;
