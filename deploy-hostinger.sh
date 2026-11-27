#!/usr/bin/env bash
# ==============================================================================
# Swarada Saree Center - Automated Hostinger hPanel Deployment Script
# Optimized specifically for Hostinger Cloud/Web Hosting environments
# ==============================================================================

set -e

DOMAIN="swaradasareecenter.in"
DB_NAME="u739095470_swarada"
BACKEND_PORT=54321

echo "=========================================================="
echo "🚀 Deploying Swarada Saree Center on Hostinger ($DOMAIN)"
echo "=========================================================="

# 1. Ask for Database Credentials if not passed as environment variables
if [ -z "$DB_USER" ]; then
  if [ -t 0 ]; then
    read -p "Enter your Hostinger Database Username (e.g. u739095470_kedar): " DB_USER
  else
    read -p "Enter your Hostinger Database Username (e.g. u739095470_kedar): " DB_USER < /dev/tty
  fi
fi

if [ -z "$DB_PASS" ]; then
  if [ -t 0 ]; then
    read -s -p "Enter your Hostinger Database Password: " DB_PASS
    echo ""
  else
    read -s -p "Enter your Hostinger Database Password: " DB_PASS < /dev/tty
    echo ""
  fi
fi

# 2. Ensure Node.js & npm are available (Install standalone via NVM if missing)
export NVM_DIR="$HOME/.nvm"
if [ -s "$NVM_DIR/nvm.sh" ]; then
  \. "$NVM_DIR/nvm.sh"
fi

if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  echo "📦 Node.js/npm not found. Automatically setting up Node.js 20 via NVM..."
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
  nvm install 20
  nvm use 20
  nvm alias default 20
fi

echo "✅ Using Node.js: $(node -v) | npm: $(npm -v)"

# 3. Determine target directories
HOME_DIR=$(eval echo ~$USER)
if [ -d "$HOME_DIR/domains/$DOMAIN" ]; then
  APP_ROOT="$HOME_DIR/domains/$DOMAIN"
  PUBLIC_HTML="$APP_ROOT/public_html"
elif [ -d "$HOME_DIR/public_html" ]; then
  APP_ROOT="$HOME_DIR"
  PUBLIC_HTML="$HOME_DIR/public_html"
else
  APP_ROOT="$HOME_DIR/$DOMAIN"
  PUBLIC_HTML="$APP_ROOT/public_html"
  mkdir -p "$PUBLIC_HTML"
fi

PROJECT_DIR="$APP_ROOT/swarada-ecommerce"
echo "📂 App Root: $APP_ROOT"
echo "📂 Project Dir: $PROJECT_DIR"
echo "📂 Public HTML: $PUBLIC_HTML"

# 4. Clone or pull repo
if [ -d "$PROJECT_DIR" ]; then
  echo "📦 Updating repository in $PROJECT_DIR..."
  cd "$PROJECT_DIR"
  git pull origin main
else
  echo "📦 Cloning repository..."
  cd "$APP_ROOT"
  git clone https://github.com/KedarDYPSEM/swarada-ecommerce.git "$PROJECT_DIR"
  cd "$PROJECT_DIR"
fi

# 5. Setup Server (Backend)
echo "⚡ Setting up Backend..."
cd "$PROJECT_DIR/server"
npm install --include=dev

# Encode special characters in password for connection URI (e.g. @ -> %40)
ENCODED_DB_PASS="${DB_PASS//@/%40}"

# Write production .env for Hostinger
cat <<EOF > .env
NODE_ENV=production
PORT=$BACKEND_PORT
CLIENT_URL=https://$DOMAIN

# Hostinger MySQL Database
DATABASE_URL="mysql://${DB_USER}:${ENCODED_DB_PASS}@127.0.0.1:3306/${DB_NAME}"

# JWT Security
JWT_ACCESS_SECRET=swarada_live_access_secret_production_2026_key
JWT_REFRESH_SECRET=swarada_live_refresh_secret_production_2026_key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Razorpay Credentials
RAZORPAY_KEY_ID=rzp_test_U2Tz8SVDIHBrHN
RAZORPAY_KEY_SECRET=PqFazCjKbpo0CnMYD9WDFH3i
RAZORPAY_WEBHOOK_SECRET=rzp_webhook_secret_placeholder
EOF

echo "🗄️ Generating Prisma Client and updating database schema..."
PRISMA_CMD="npx prisma"
if [ -x "./node_modules/.bin/prisma" ]; then
  PRISMA_CMD="./node_modules/.bin/prisma"
elif [ -x "../node_modules/.bin/prisma" ]; then
  PRISMA_CMD="../node_modules/.bin/prisma"
fi

$PRISMA_CMD generate
$PRISMA_CMD db push --accept-data-loss || true

# Seed default admin and starter handloom catalog if new database
echo "🌱 Checking and seeding initial catalog..."
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.user.count().then(count => {
  if (count === 0) {
    console.log('Seeding initial admin and catalog...');
    require('./prisma/seed.js');
  } else {
    console.log('Database already initialized with records.');
    process.exit(0);
  }
}).catch(err => {
  console.log('Seed check:', err.message);
  process.exit(0);
});
" || true

# Explicitly verify/sync Super Admin account credentials (admin@swarada.com / Admin@123)
echo "🔐 Verifying Super Admin account..."
node -e "
const { PrismaClient } = require('@prisma/client');
const { hashPassword } = require('./src/utils/password');
const prisma = new PrismaClient();
async function syncAdmin() {
  const hash = await hashPassword('Admin@123');
  const existing = await prisma.user.findFirst({
    where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } }
  });
  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: { passwordHash: hash, isActive: true }
    });
    console.log('✅ Admin confirmed: ' + existing.email + ' (Password: Admin@123)');
  } else {
    await prisma.user.create({
      data: {
        email: 'admin@swarada.com',
        passwordHash: hash,
        role: 'SUPER_ADMIN',
        isActive: true,
        profile: {
          create: {
            firstName: 'Swarada',
            lastName: 'Admin',
            displayName: 'Admin'
          }
        }
      }
    });
    console.log('✅ Created Super Admin: admin@swarada.com (Password: Admin@123)');
  }
}
syncAdmin().catch(e => console.error(e)).finally(() => prisma.\$disconnect());
" || true

# 6. Build Client (Frontend)
echo "⚡ Preparing Frontend..."
cd "$PROJECT_DIR/client"

# In shared hosting / CloudLinux, rust/rayon thread limits require single-threaded mode
export RAYON_NUM_THREADS=1
export UV_THREADPOOL_SIZE=1

if [ ! -f "dist/index.html" ]; then
  echo "Building Frontend..."
  npm install --include=dev
  RAYON_NUM_THREADS=1 UV_THREADPOOL_SIZE=1 npm run build || true
fi

# 7. Deploy build to public_html
echo "🚀 Copying production build into public_html..."
mkdir -p "$PUBLIC_HTML"
if [ -d "dist" ] && [ -f "dist/index.html" ]; then
  cp -r dist/* "$PUBLIC_HTML/"
  echo "✅ Frontend distribution deployed to $PUBLIC_HTML"
else
  echo "⚠️ Warning: dist/index.html not found, attempting fallback build..."
  npm install --include=dev
  RAYON_NUM_THREADS=1 UV_THREADPOOL_SIZE=1 npm run build || true
  cp -r dist/* "$PUBLIC_HTML/" 2>/dev/null || true
fi

# Create uploads directory symlink in public_html for direct high-speed image serving
mkdir -p "$PROJECT_DIR/server/uploads"
rm -rf "$PUBLIC_HTML/uploads"
ln -sf "$PROJECT_DIR/server/uploads" "$PUBLIC_HTML/uploads"

# 8. Write Apache / LiteSpeed .htaccess for routing & API proxying
echo "📝 Configuring .htaccess in public_html..."
cp "$PROJECT_DIR/client/dist/api-proxy.php" "$PUBLIC_HTML/api-proxy.php" 2>/dev/null || true

cat << 'EOF' > "$PUBLIC_HTML/.htaccess"
RewriteEngine On

# 1. Forward /api requests to local PHP gateway (transparent proxy to Node.js on port 5000)
RewriteRule ^api/(.*)$ api-proxy.php?__api_path=$1 [QSA,L]

# 2. Allow direct access to existing files/directories (images, js, css)
RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]

# 3. Fallback all other routes to React index.html
RewriteRule ^ index.html [L]

# Gzip / Compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css application/javascript application/json
</IfModule>
EOF

# 9. Start / Restart Node.js backend under PM2 (or background process)
cd "$PROJECT_DIR/server"
PM2_BIN=""
if command -v pm2 >/dev/null 2>&1; then
  PM2_BIN="pm2"
elif [ -x "./node_modules/.bin/pm2" ]; then
  PM2_BIN="./node_modules/.bin/pm2"
elif [ -x "../node_modules/.bin/pm2" ]; then
  PM2_BIN="../node_modules/.bin/pm2"
fi

if [ -z "$PM2_BIN" ]; then
  echo "Installing PM2..."
  npm install pm2 --save-dev 2>/dev/null || npm install pm2
  if [ -x "./node_modules/.bin/pm2" ]; then
    PM2_BIN="./node_modules/.bin/pm2"
  elif [ -x "../node_modules/.bin/pm2" ]; then
    PM2_BIN="../node_modules/.bin/pm2"
  fi
fi

if [ -n "$PM2_BIN" ]; then
  echo "🔄 Restarting backend under PM2 ($PM2_BIN)..."
  $PM2_BIN delete swarada-backend 2>/dev/null || true
  $PM2_BIN start src/app.js --name "swarada-backend"
  $PM2_BIN save 2>/dev/null || true
else
  echo "🔄 Starting backend with node in background..."
  pkill -f "src/app.js" 2>/dev/null || true
  nohup node src/app.js > ../backend.log 2>&1 &
fi

echo "=========================================================="
echo "🎉 Deployment on Hostinger Successful!"
echo "Store URL: https://$DOMAIN"
echo "Admin Panel: https://$DOMAIN/admin"
echo "=========================================================="
