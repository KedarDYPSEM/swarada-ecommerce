const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const { errorHandler, AppError } = require('./middleware/errorHandler');

require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config(); // Fallback to root .env if present

const app = express();
const PORT = process.env.PORT || 5000;

// Trust reverse proxy (Hostinger Passenger / Nginx / LiteSpeed)
app.set('trust proxy', 1);

// ─── Security ───────────────────────────────────────────
// Disable strict CSP in helmet so React SPA (inline styles/scripts, external fonts, images) renders smoothly
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// ─── Static Uploads ─────────────────────────────────────
const serverUploads = path.join(__dirname, '../uploads');
const rootUploads = path.join(__dirname, '../../uploads');
const publicUploads = path.join(__dirname, '../../../../public_html/uploads');

if (!fs.existsSync(serverUploads)) {
  try { fs.mkdirSync(serverUploads, { recursive: true }); } catch (e) {}
}
app.use('/uploads', express.static(serverUploads, { maxAge: '30d' }));
if (fs.existsSync(rootUploads)) {
  app.use('/uploads', express.static(rootUploads, { maxAge: '30d' }));
}
if (fs.existsSync(publicUploads)) {
  app.use('/uploads', express.static(publicUploads, { maxAge: '30d' }));
}

// ─── CORS ───────────────────────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_URL,
  'https://swaradasareecenter.in',
  'http://swaradasareecenter.in',
  'https://www.swaradasareecenter.in',
  'http://www.swaradasareecenter.in',
  'http://localhost:5173',
  'http://localhost:5000',
  'http://localhost:3000',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, true); // Fallback allow to avoid unexpected deployment CORS blockage
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// ─── Rate Limiting ──────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again in a few moments.' },
  keyGenerator: (req) => {
    return (
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.socket?.remoteAddress ||
      'cluster-client'
    );
  },
  skip: (req) => {
    const p = req.originalUrl || req.url || '';
    if (p.includes('/api/admin') || p.includes('/api/settings')) {
      return true;
    }
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || '';
    return ip === '127.0.0.1' || ip === '::1';
  },
});
app.use('/api/', limiter);

// ─── Body Parsing ───────────────────────────────────────
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));
app.use(cookieParser());

// ─── Logging ────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ─── Health Check ───────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    mode: 'nodejs-web-app',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ─── Dynamic Favicon Direct Fallback ────────────────────
const prisma = require('./config/database');

app.get(['/favicon.ico', '/favicon.png', '/apple-touch-icon.png'], async (req, res, next) => {
  try {
    const logoSetting = await prisma.setting.findUnique({
      where: { key: 'store_logo_url' },
    });
    if (logoSetting && logoSetting.value) {
      const cleanPath = logoSetting.value.replace(/^https?:\/\/[^/]+(\/uploads\/)/i, '$1');
      if (cleanPath.startsWith('/uploads/')) {
        const filePath = path.join(__dirname, '..', cleanPath);
        if (fs.existsSync(filePath)) {
          return res.sendFile(filePath);
        }
      }
    }
  } catch (err) {
    // Fall back to static
  }
  next();
});

// ─── API Routes ─────────────────────────────────────────
const apiRoutes = require('./routes');
app.use('/api', apiRoutes);

// ─── Serve React Frontend (Single Page Application) ─────
const clientDistCandidates = [
  path.join(__dirname, '../../client/dist'),
  path.join(__dirname, '../public'),
  path.join(__dirname, '../client/dist'),
  path.join(process.cwd(), 'client/dist'),
  path.join(process.cwd(), 'public_html'),
];

let clientDistPath = null;
for (const cand of clientDistCandidates) {
  if (fs.existsSync(path.join(cand, 'index.html'))) {
    clientDistPath = cand;
    break;
  }
}

if (clientDistPath) {
  console.log(`📦 Serving React frontend from: ${clientDistPath}`);
  
  // Static assets with caching
  app.use(express.static(clientDistPath, {
    maxAge: '7d',
    index: false,
  }));

  // SPA fallback for all non-API and non-upload routes (compatible with Express 4 and Express 5)
  app.use((req, res, next) => {
    if (req.method !== 'GET') {
      return next();
    }
    if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// ─── 404 Handler for Unhandled API / Upload Routes ──────
app.use((req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
});

// ─── Global Error Handler ───────────────────────────────
app.use(errorHandler);

// ─── Global Exception Logging ───────────────────────────
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
});

// ─── Server Startup Function ────────────────────────────
let serverInstance = null;
function startServer() {
  if (serverInstance || process.env.NODE_ENV === 'test') {
    return serverInstance;
  }
  const listenPort = process.env.PORT || 5000;
  serverInstance = app.listen(listenPort, () => {
    console.log(`🚀 Swarada Saree Center Node.js Web App listening on port ${listenPort}`);
  });
  serverInstance.on('error', (err) => {
    console.error('💥 Server Listen Error:', err);
  });
  return serverInstance;
}

// Auto-start if run directly or inside Hostinger Passenger / LiteSpeed Node runner
if (
  require.main === module ||
  process.env.PASSENGER_APP_ENV ||
  process.env.PHUSION_PASSENGER ||
  process.env.NODE_RUNNER
) {
  startServer();
}

app.startServer = startServer;
module.exports = app;
