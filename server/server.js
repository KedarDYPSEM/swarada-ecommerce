// ─────────────────────────────────────────────────────────────
// Swarada Saree Center - Server Entrypoint for Hostinger Web App
// ─────────────────────────────────────────────────────────────

const path = require('path');
const fs = require('fs');

// Load environment variables from .env
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
}
require('dotenv').config();

const app = require('./src/app');

// Ensure server is started
if (typeof app.startServer === 'function') {
  app.startServer();
}

module.exports = app;
