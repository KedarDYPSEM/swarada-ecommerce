#!/usr/bin/env bash
# ==============================================================================
# One-Click Update Script for demo.dypesconf.io on VPS
# Can be run from ANY directory as root or normal user
# ==============================================================================

set -e

APP_DIR="/var/www/swarada-ecommerce"

if [ ! -d "$APP_DIR" ]; then
  echo "❌ Error: $APP_DIR does not exist. Please check your installation directory."
  exit 1
fi

echo "=========================================================="
echo "🔄 Updating Swarada Saree Center at $APP_DIR..."
echo "=========================================================="

# 1. Pull latest code from GitHub
cd "$APP_DIR"
git pull origin main

# 2. Update Database Schema & Backend
echo "🗄️ Syncing database schema & generating Prisma client..."
cd "$APP_DIR/server"
npm install --include=dev
./node_modules/.bin/prisma generate
./node_modules/.bin/prisma db push --accept-data-loss || true

# 3. Build Client Assets
echo "⚡ Building latest frontend bundle..."
cd "$APP_DIR/client"
npm install
npm run build

# 4. Restart Backend Process under PM2
echo "🔄 Restarting backend service..."
pm2 restart swarada-backend || pm2 restart all

# 5. Reload Nginx cache
echo "🔄 Reloading Nginx..."
sudo systemctl reload nginx 2>/dev/null || true

echo "=========================================================="
echo "🎉 Update successfully deployed to https://demo.dypesconf.io!"
echo "=========================================================="
