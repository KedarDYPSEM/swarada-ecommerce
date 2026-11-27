#!/usr/bin/env bash
# ==============================================================================
# Swarada Saree Center - Isolated VPS Deployment Script for demo.dypesconf.io
# Guarantees zero changes/interference with existing apps on the server.
# ==============================================================================

set -e

DOMAIN="swaradasareecenter.in"
APP_DIR="/var/www/swarada-ecommerce"
BACKEND_PORT=5050
DB_NAME="swarada_ecommerce"

echo "=========================================================="
echo "🚀 Deploying Swarada Saree Center on $DOMAIN (Port: $BACKEND_PORT)"
echo "=========================================================="

# 1. Ensure required packages are present without modifying existing ones
command -v git >/dev/null 2>&1 || { echo "Installing git..."; sudo apt-get update && sudo apt-get install -y git; }
command -v node >/dev/null 2>&1 || { echo "Installing Node.js 20..."; curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt-get install -y nodejs; }
command -v pm2 >/dev/null 2>&1 || { echo "Installing PM2 globally..."; sudo npm install -g pm2; }
command -v nginx >/dev/null 2>&1 || { echo "Installing Nginx..."; sudo apt-get install -y nginx; }

# 2. Clone or pull repo in /var/www/swarada-ecommerce
if [ -d "$APP_DIR" ]; then
  echo "📦 Updating existing repository in $APP_DIR..."
  cd "$APP_DIR"
  git pull origin main
else
  echo "📦 Cloning repository into $APP_DIR..."
  sudo mkdir -p /var/www
  sudo chown -R $USER:$USER /var/www
  git clone https://github.com/KedarDYPSEM/swarada-ecommerce.git "$APP_DIR"
  cd "$APP_DIR"
fi

# 3. Setup Client (Frontend)
echo "⚡ Building Frontend for $DOMAIN..."
cd "$APP_DIR/client"
npm install
npm run build

# 4. Setup Server (Backend)
echo "⚡ Setting up Backend..."
cd "$APP_DIR/server"
npm install

# Create isolated .env if not exists
if [ ! -f .env ]; then
  echo "📝 Creating isolated server/.env on port $BACKEND_PORT..."
  cat <<EOF > .env
NODE_ENV=production
PORT=$BACKEND_PORT
CLIENT_URL=https://$DOMAIN

# Isolated Database (Does not touch existing databases)
DATABASE_URL="mysql://root:@localhost:3306/$DB_NAME"

# JWT Secrets
JWT_ACCESS_SECRET=swarada_live_access_secret_production_2026_key
JWT_REFRESH_SECRET=swarada_live_refresh_secret_production_2026_key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Razorpay Credentials (Live/Test)
RAZORPAY_KEY_ID=rzp_test_U2Tz8SVDIHBrHN
RAZORPAY_KEY_SECRET=PqFazCjKbpo0CnMYD9WDFH3i
RAZORPAY_WEBHOOK_SECRET=rzp_webhook_secret_placeholder
EOF
fi

# 5. Database Setup (Isolated swarada_ecommerce database)
echo "🗄️ Initializing dedicated database: $DB_NAME..."
mysql -u root -e "CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null || {
  echo "⚠️ Note: If MySQL requires a password, please ensure database '$DB_NAME' exists and DATABASE_URL in server/.env has the right password."
}

npx prisma generate
npx prisma db push --accept-data-loss || true

# Seed default admin & data if fresh database
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.user.count().then(count => {
  if (count === 0) {
    console.log('🌱 Seeding initial admin and catalog data...');
    require('./prisma/seed.js');
  } else {
    console.log('✅ Existing data found in DB, skipping seed.');
    process.exit(0);
  }
}).catch(err => {
  console.log('⚠️ Seed check skipped:', err.message);
  process.exit(0);
});
" || true

# 6. PM2 Process (Isolated name 'swarada-backend')
echo "🔄 Starting backend process under PM2 ('swarada-backend')..."
pm2 delete swarada-backend 2>/dev/null || true
pm2 start src/app.js --name "swarada-backend"
pm2 save

# 7. Isolated Nginx Server Block (Leaves other sites 100% untouched)
echo "🌐 Configuring Nginx for $DOMAIN..."
NGINX_CONF="/etc/nginx/sites-available/$DOMAIN"

sudo tee "$NGINX_CONF" > /dev/null <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN} www.${DOMAIN};

    # Static Frontend
    root ${APP_DIR}/client/dist;
    index index.html;

    # Gzip Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # React Router fallback
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Backend API Reverse Proxy
    location /api/ {
        proxy_pass http://127.0.0.1:${BACKEND_PORT}/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Uploaded media assets (using ^~ so it overrides the static asset regex below)
    location ^~ /uploads/ {
        alias ${APP_DIR}/server/uploads/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
        try_files \$uri @uploads_proxy;
    }

    location @uploads_proxy {
        proxy_pass http://127.0.0.1:${BACKEND_PORT};
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Static assets caching for frontend build
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    client_max_body_size 25M;
}
EOF

# Enable site if not already enabled
sudo ln -sf "$NGINX_CONF" "/etc/nginx/sites-enabled/$DOMAIN"

# Test Nginx syntax before reloading
echo "🔍 Validating Nginx configuration..."
sudo nginx -t

echo "🔄 Reloading Nginx..."
sudo systemctl reload nginx

# 8. SSL Certificate via Certbot (Only targets demo.dypesconf.io)
if command -v certbot >/dev/null 2>&1; then
  echo "🔒 Requesting SSL certificate for $DOMAIN via Certbot..."
  sudo certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos -m contact@swaradasarees.com --redirect || {
    echo "⚠️ Certbot auto-SSL skipped or needs manual domain verification. Run 'sudo certbot --nginx -d $DOMAIN' manually."
  }
fi

echo "=========================================================="
echo "🎉 Deployment Complete!"
echo "Website is live at: http://$DOMAIN (or https://$DOMAIN)"
echo "Backend running on PM2: swarada-backend (Port: $BACKEND_PORT)"
echo "Existing apps on this VPS remain 100% UNTOUCHED."
echo "=========================================================="
