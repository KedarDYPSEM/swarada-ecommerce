const express = require('express');
const customerController = require('../controllers/customerController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/addresses', customerController.getAddresses);
router.post('/addresses', customerController.addAddress);
router.delete('/addresses/:id', customerController.deleteAddress);

module.exports = router;
