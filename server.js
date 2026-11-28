// ─────────────────────────────────────────────────────────────
// Swarada Saree Center - Node.js Web App Root Entrypoint
// Suitable for Hostinger Node.js Web App, cPanel Node Selector, VPS & Local
// ─────────────────────────────────────────────────────────────

const path = require('path');
const fs = require('fs');
const Module = require('module');

// Ensure server/node_modules is included in require paths
const serverNodeModules = path.join(__dirname, 'server/node_modules');
if (fs.existsSync(serverNodeModules)) {
  process.env.NODE_PATH = serverNodeModules + (process.env.NODE_PATH ? path.delimiter + process.env.NODE_PATH : '');
  Module._initPaths();
}

// Load environment variables from server/.env if available
const serverEnvPath = path.join(__dirname, 'server/.env');
if (fs.existsSync(serverEnvPath)) {
  try {
    require('dotenv').config({ path: serverEnvPath });
  } catch (e) {}
}
try {
  require('dotenv').config(); // Fallback to root .env
} catch (e) {}

const app = require('./server/src/app');

// Ensure server is listening on assigned PORT
if (typeof app.startServer === 'function') {
  app.startServer();
}

module.exports = app;
