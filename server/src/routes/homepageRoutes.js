const express = require('express');
const homepageController = require('../controllers/homepageController');

const router = express.Router();

router.get('/', homepageController.getHomepageData);
router.get('/banners', homepageController.getBanners);

module.exports = router;
