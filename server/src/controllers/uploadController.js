const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { AppError } = require('../middleware/errorHandler');

// Ensure upload directory exists
const UPLOAD_DIR = path.join(__dirname, '../../uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    cb(null, `swarada_${cleanName}_${uniqueSuffix}${ext}`);
  },
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Only valid image files (JPEG, PNG, WEBP, GIF, AVIF) are permitted.', 400), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

/**
 * Handle single image upload
 */
const uploadSingle = (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Please select an image file to upload.', 400));
  }

  const host = req.get('host');
  const protocol = req.protocol;
  const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

  res.status(200).json({
    status: 'success',
    message: 'Image uploaded successfully.',
    data: {
      url: fileUrl,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
    },
  });
};

/**
 * Handle multiple images upload
 */
const uploadMultiple = (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next(new AppError('Please select at least one image file to upload.', 400));
  }

  const host = req.get('host');
  const protocol = req.protocol;
  const files = req.files.map((f) => ({
    url: `${protocol}://${host}/uploads/${f.filename}`,
    filename: f.filename,
    size: f.size,
    mimetype: f.mimetype,
  }));

  res.status(200).json({
    status: 'success',
    message: `${files.length} images uploaded successfully.`,
    data: {
      files,
      urls: files.map((f) => f.url),
    },
  });
};

module.exports = {
  uploadMiddleware: upload,
  uploadSingle,
  uploadMultiple,
};
