const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { AppError } = require('../middleware/errorHandler');

// Ensure upload directory exists and is fully writable
const UPLOAD_DIR = path.join(__dirname, '../../uploads');
try {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
  fs.chmodSync(UPLOAD_DIR, 0o777);
} catch (e) {
  // Best effort
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

// Permissive file filter for all standard mobile and desktop image/video formats
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/pjpeg',
    'image/png',
    'image/x-png',
    'image/webp',
    'image/gif',
    'image/avif',
    'image/heic',
    'image/heif',
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'video/ogg',
    'video/x-m4v',
    'video/mpeg',
  ];

  const ext = path.extname(file.originalname || '').toLowerCase();
  const allowedExts = [
    '.jpg',
    '.jpeg',
    '.png',
    '.webp',
    '.gif',
    '.avif',
    '.heic',
    '.heif',
    '.mp4',
    '.webm',
    '.mov',
    '.ogg',
  ];

  if (
    allowedMimes.includes(file.mimetype) ||
    allowedExts.includes(ext) ||
    file.mimetype?.startsWith('image/') ||
    file.mimetype?.startsWith('video/')
  ) {
    cb(null, true);
  } else {
    cb(new AppError('Only valid image files (JPEG, PNG, WEBP, GIF, HEIC) or video files (MP4, WEBM, MOV) are permitted.', 400), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB limit as requested
  },
});

/**
 * Handle single image or video upload
 */
const uploadSingle = (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Please select an image or video file to upload.', 400));
  }

  // Also mirror to public_html/uploads if public_html exists (for direct high-speed LiteSpeed serving)
  const publicUploadDir = path.join(__dirname, '../../../../public_html/uploads');
  if (fs.existsSync(path.dirname(publicUploadDir))) {
    try {
      if (!fs.existsSync(publicUploadDir)) {
        fs.mkdirSync(publicUploadDir, { recursive: true });
      }
      fs.copyFileSync(req.file.path, path.join(publicUploadDir, req.file.filename));
    } catch (e) {
      console.warn('Could not mirror file to public_html/uploads:', e.message);
    }
  }

  // Use root-relative URL so it works seamlessly under HTTP, HTTPS, localhost, or reverse proxies
  const fileUrl = `/uploads/${req.file.filename}`;
  const isVideo = req.file.mimetype.startsWith('video/');

  res.status(200).json({
    status: 'success',
    message: isVideo ? 'Video uploaded successfully.' : 'Image uploaded successfully.',
    data: {
      url: fileUrl,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
      isVideo,
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

  // Also mirror to public_html/uploads if public_html exists
  const publicUploadDir = path.join(__dirname, '../../../../public_html/uploads');
  if (fs.existsSync(path.dirname(publicUploadDir))) {
    try {
      if (!fs.existsSync(publicUploadDir)) {
        fs.mkdirSync(publicUploadDir, { recursive: true });
      }
      req.files.forEach((f) => {
        fs.copyFileSync(f.path, path.join(publicUploadDir, f.filename));
      });
    } catch (e) {
      console.warn('Could not mirror files to public_html/uploads:', e.message);
    }
  }

  const files = req.files.map((f) => ({
    url: `/uploads/${f.filename}`,
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
