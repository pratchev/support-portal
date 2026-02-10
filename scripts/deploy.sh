#!/bin/bash

# Support Portal Production Deployment Script
# This script deploys the application to an Ubuntu server

set -e

echo "🚀 Deploying Support Portal to Production..."

# Configuration
APP_DIR="/opt/support-portal"
APP_USER="support-portal"
NODE_VERSION="22"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Please run as root (use sudo)"
    exit 1
fi

# Update system
echo "📦 Updating system packages..."
apt-get update
apt-get upgrade -y

# Install Node.js if not installed
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js ${NODE_VERSION}..."
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
    apt-get install -y nodejs
fi

# Install PM2 if not installed
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    npm install -g pm2
fi

# Install Nginx if not installed
if ! command -v nginx &> /dev/null; then
    echo "📦 Installing Nginx..."
    apt-get install -y nginx
fi

# Create application user if not exists
if ! id "$APP_USER" &>/dev/null; then
    echo "👤 Creating application user..."
    useradd -r -s /bin/bash -d $APP_DIR $APP_USER
fi

# Create application directory
if [ ! -d "$APP_DIR" ]; then
    echo "📁 Creating application directory..."
    mkdir -p $APP_DIR
    chown $APP_USER:$APP_USER $APP_DIR
fi

# Clone or pull repository
cd $APP_DIR
if [ ! -d ".git" ]; then
    echo "📥 Cloning repository..."
    sudo -u $APP_USER git clone https://github.com/pratchev/support-portal.git .
else
    echo "📥 Pulling latest changes..."
    sudo -u $APP_USER git pull origin main
fi

# Install dependencies
echo "📦 Installing dependencies..."
sudo -u $APP_USER npm ci

# Build application
echo "🔨 Building application..."
sudo -u $APP_USER npm run build

# Run database migrations
echo "🗄️  Running database migrations..."
cd $APP_DIR/apps/api
sudo -u $APP_USER npx prisma migrate deploy

# Configure PM2
echo "⚙️  Configuring PM2..."
cat > $APP_DIR/ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'support-portal-api',
      cwd: '$APP_DIR/apps/api',
      script: 'dist/index.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 4000
      }
    },
    {
      name: 'support-portal-web',
      cwd: '$APP_DIR/apps/web',
      script: 'node_modules/.bin/next',
      args: 'start',
      instances: 1,
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
};
EOF

chown $APP_USER:$APP_USER $APP_DIR/ecosystem.config.js

# Start/restart applications with PM2
echo "🔄 Starting applications with PM2..."
sudo -u $APP_USER pm2 delete all || true
sudo -u $APP_USER pm2 start $APP_DIR/ecosystem.config.js
sudo -u $APP_USER pm2 save
pm2 startup systemd -u $APP_USER --hp $APP_DIR

# Configure Nginx
echo "⚙️  Configuring Nginx..."
cat > /etc/nginx/sites-available/support-portal << 'EOF'
# Frontend (Next.js)
upstream frontend {
    server localhost:3000;
}

# Backend API (Express)
upstream backend {
    server localhost:4000;
}

server {
    listen 80;
    server_name support.yourdomain.com;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket
    location /socket.io {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
EOF

ln -sf /etc/nginx/sites-available/support-portal /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and reload Nginx
nginx -t
systemctl reload nginx

# Setup SSL with Let's Encrypt
echo "🔒 Setting up SSL certificate..."
if command -v certbot &> /dev/null; then
    echo "Run: certbot --nginx -d support.yourdomain.com"
else
    echo "Install certbot: apt-get install -y certbot python3-certbot-nginx"
fi

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update DNS to point to this server"
echo "2. Configure .env file in $APP_DIR"
echo "3. Run SSL setup: certbot --nginx -d support.yourdomain.com"
echo "4. Configure Docker services (PostgreSQL, Redis)"
echo ""
echo "🔧 Useful commands:"
echo "   pm2 status            - Check application status"
echo "   pm2 logs              - View application logs"
echo "   pm2 restart all       - Restart applications"
echo "   systemctl status nginx - Check Nginx status"
echo "   nginx -t              - Test Nginx configuration"
echo ""
