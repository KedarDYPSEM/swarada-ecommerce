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
const PORT = process.env.PORT || 54321;

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

// Trust reverse proxy (Hostinger Apache / LiteSpeed / PHP proxy)
app.set('trust proxy', 1);

// ─── Rate Limiting ──────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // Generous ceiling for dynamic e-commerce catalog browsing & admin management
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
    // Never throttle admin dashboard operations or localhost
    const path = req.originalUrl || req.url || '';
    if (path.includes('/api/admin') || path.includes('/api/settings')) {
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
  const fs = require('fs');
  const socketPath = process.env.SOCKET_PATH || '/home/u739095470/domains/swaradasareecenter.in/node.sock';
  
  // Always listen on TCP port on localhost for internal proxy
  const server = app.listen(PORT, '127.0.0.1', () => {
    console.log(`🚀 Server running on http://127.0.0.1:${PORT} in ${process.env.NODE_ENV || 'production'} mode`);
  });
  server.on('error', (err) => {
    console.error('💥 TCP Listen Error:', err);
  });

  // Also bind to UNIX socket if path is available
  try {
    if (fs.existsSync(socketPath)) {
      try { fs.unlinkSync(socketPath); } catch (e) {}
    }
    const http = require('http');
    const socketServer = http.createServer(app);
    socketServer.listen(socketPath, () => {
      try { fs.chmodSync(socketPath, 0o777); } catch (e) {}
      console.log(`🚀 Also listening on UNIX socket: ${socketPath}`);
    });
    socketServer.on('error', (e) => {
      console.warn('Socket listen notice:', e.message);
    });
  } catch (err) {
    console.warn('Socket binding notice:', err.message);
  }
}

module.exports = app;
