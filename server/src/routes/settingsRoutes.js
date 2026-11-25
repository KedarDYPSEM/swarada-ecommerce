const express = require('express');
const { authenticate, requireRole } = require('../middleware/auth');
const settingsController = require('../controllers/settingsController');

const router = express.Router();

// Public endpoints
router.get('/public', settingsController.getPublicSettings);
router.get('/youtube-live', settingsController.getYouTubeLiveInfo);

// Admin-protected endpoints
router.get('/', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'), settingsController.getAdminSettings);
router.put('/', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'), settingsController.updateSettings);

module.exports = router;
