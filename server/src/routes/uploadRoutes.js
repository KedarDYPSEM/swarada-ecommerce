const express = require('express');
const uploadController = require('../controllers/uploadController');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

// Upload endpoints (accessible to admin users)
router.post(
  '/',
  authenticate,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  uploadController.uploadMiddleware.single('image'),
  uploadController.uploadSingle
);

router.post(
  '/multiple',
  authenticate,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  uploadController.uploadMiddleware.array('images', 10),
  uploadController.uploadMultiple
);

module.exports = router;
