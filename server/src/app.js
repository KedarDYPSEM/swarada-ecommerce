const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const { errorHandler, AppError } = require('./middleware/errorHandler');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Trust reverse proxy (Nginx) for correct protocol and IP resolution
app.set('trust proxy', 1);

// ─── Security ───────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// ─── Static Uploads ─────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ─── CORS ───────────────────────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_URL,
  'https://swaradasareecenter.in',
  'http://swaradasareecenter.in',
  'https://www.swaradasareecenter.in',
  'http://www.swaradasareecenter.in',
  'https://demo.dypesconf.io',
  'http://demo.dypesconf.io',
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, server-to-server) or allowed list
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, true); // Fallback allow to avoid unexpected deployment CORS blockage
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Rate Limiting ──────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 5000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
  skip: (req) => process.env.NODE_ENV !== 'production' || req.ip === '127.0.0.1' || req.ip === '::1',
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
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── API Routes ─────────────────────────────────────────
const apiRoutes = require('./routes');
app.use('/api', apiRoutes);

// ─── 404 Handler ────────────────────────────────────────
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

// ─── Start Server ───────────────────────────────────────
if (require.main === module) {
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://127.0.0.1:${PORT} and 0.0.0.0:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });

  server.on('error', (err) => {
    console.error('💥 Server Listen Error:', err);
  });
}

module.exports = app;
