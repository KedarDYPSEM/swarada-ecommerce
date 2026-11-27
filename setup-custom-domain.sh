#!/usr/bin/env bash
# ==============================================================================
# Swarada Saree Center - Setup Custom Domain: swaradasareecenter.in
# Configures Nginx, SSL (Certbot HTTPS), and links to live backend on port 5050
# ==============================================================================

set -e

DOMAIN="swaradasareecenter.in"
WWW_DOMAIN="www.swaradasareecenter.in"
APP_DIR="/var/www/swarada-ecommerce"
BACKEND_PORT=5050

echo "=========================================================="
echo "🚀 Configuring domain: $DOMAIN and $WWW_DOMAIN"
echo "=========================================================="

# 1. Update repository
cd "$APP_DIR"
git pull origin main

# 2. Update .env CLIENT_URL
if [ -f "$APP_DIR/server/.env" ]; then
  echo "📝 Updating CLIENT_URL to https://$DOMAIN..."
  sed -i "s|CLIENT_URL=.*|CLIENT_URL=https://$DOMAIN|g" "$APP_DIR/server/.env"
fi

# 3. Create Nginx Configuration for swaradasareecenter.in
NGINX_CONF="/etc/nginx/sites-available/$DOMAIN"
echo "🌐 Writing Nginx configuration to $NGINX_CONF..."

sudo tee "$NGINX_CONF" > /dev/null <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN} ${WWW_DOMAIN};

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

    # Uploaded media assets
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

    # Static assets caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    client_max_body_size 25M;
}
EOF

# 4. Enable site in Nginx
echo "🔗 Enabling Nginx site..."
sudo ln -sf "$NGINX_CONF" "/etc/nginx/sites-enabled/$DOMAIN"

# 5. Validate and reload Nginx
echo "🔍 Validating Nginx configuration..."
sudo nginx -t

echo "🔄 Reloading Nginx..."
sudo systemctl reload nginx

# 6. Restart PM2 backend process
echo "🔄 Restarting backend process..."
pm2 restart swarada-backend || pm2 restart all

# 7. Request SSL Certificate with Certbot
echo "🔒 Securing domain with Let's Encrypt SSL (HTTPS)..."
if command -v certbot >/dev/null 2>&1; then
  sudo certbot --nginx -d "$DOMAIN" -d "$WWW_DOMAIN" --non-interactive --agree-tos -m orders@swaradasareecenter.com --redirect || {
    echo "⚠️ Note: Certbot SSL setup will succeed once DNS propagation reaches this VPS (usually 5-15 mins)."
    echo "You can re-run 'sudo certbot --nginx -d $DOMAIN -d $WWW_DOMAIN' at any time."
  }
fi

echo "=========================================================="
echo "🎉 Congratulations! $DOMAIN is configured on your VPS."
echo "Visit: https://$DOMAIN"
echo "=========================================================="
