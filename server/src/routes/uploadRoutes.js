const express = require('express');
const uploadController = require('../controllers/uploadController');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

// Middleware that accepts upload under any field name ('image', 'video', 'file', etc.)
const handleAnySingleUpload = (req, res, next) => {
  uploadController.uploadMiddleware.any()(req, res, (err) => {
    if (err) return next(err);
    if (req.files && req.files.length > 0) {
      req.file = req.files[0];
    }
    next();
  });
};

// Upload endpoints (accessible to admin users)
router.post(
  '/',
  authenticate,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  handleAnySingleUpload,
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
