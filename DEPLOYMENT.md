# Deployment Guide

This guide covers deploying Support Portal to a production Ubuntu server.

## 📋 Prerequisites

### Server Requirements

- **OS**: Ubuntu 22.04 LTS or higher
- **RAM**: Minimum 4GB (8GB recommended)
- **CPU**: 2+ cores
- **Disk**: 50GB+ available space
- **Ports**: 80 (HTTP), 443 (HTTPS) open

### Required Software

- Node.js 22+
- Docker & Docker Compose
- Nginx
- PM2 (process manager)
- PostgreSQL 16 (can run in Docker)
- Redis 7 (can run in Docker)
- Certbot (for SSL)

## 🚀 Automated Deployment

### Quick Deploy

```bash
# SSH into your server
ssh user@your-server.com

# Run the deployment script as root
sudo ./scripts/deploy.sh
```

This script will:
1. Install all prerequisites
2. Create application user
3. Clone repository
4. Install dependencies
5. Build application
6. Configure PM2
7. Setup Nginx
8. Configure services

## 📖 Manual Deployment

### Step 1: Prepare Server

```bash
# Update system
sudo apt-get update
sudo apt-get upgrade -y

# Install Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version  # Should be 22.x.x
npm --version
```

### Step 2: Install Docker

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt-get install docker-compose-plugin

# Add user to docker group
sudo usermod -aG docker $USER

# Verify installation
docker --version
docker compose version
```

### Step 3: Install Nginx

```bash
sudo apt-get install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### Step 4: Install PM2

```bash
sudo npm install -g pm2
pm2 --version
```

### Step 5: Setup Application

```bash
# Create application directory
sudo mkdir -p /opt/support-portal
sudo chown $USER:$USER /opt/support-portal
cd /opt/support-portal

# Clone repository
git clone https://github.com/pratchev/support-portal.git .

# Install dependencies
npm ci

# Create production environment file
cp .env.example .env
nano .env  # Edit with production values
```

### Step 6: Configure Environment

Edit `/opt/support-portal/.env`:

```env
# Production Database
DATABASE_URL=postgresql://username:password@localhost:5432/support_portal

# Redis
REDIS_URL=redis://localhost:6379

# Authentication
NEXTAUTH_URL=https://support.yourdomain.com
NEXTAUTH_SECRET=your-super-secure-secret-generate-with-openssl

# OAuth Credentials
GOOGLE_CLIENT_ID=your-production-client-id
GOOGLE_CLIENT_SECRET=your-production-client-secret
AZURE_AD_CLIENT_ID=your-production-client-id
AZURE_AD_CLIENT_SECRET=your-production-client-secret
AZURE_AD_TENANT_ID=your-tenant-id

# Azure OpenAI
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_KEY=your-production-api-key
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4o

# Microsoft Graph API
GRAPH_CLIENT_ID=your-graph-app-id
GRAPH_CLIENT_SECRET=your-graph-secret
GRAPH_TENANT_ID=your-tenant-id
SUPPORT_MAILBOX=support@yourdomain.com

# Email Configuration
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=noreply@yourdomain.com
SMTP_PASSWORD=your-smtp-password
EMAIL_FROM_NAME=Support Portal
EMAIL_FROM_ADDRESS=noreply@yourdomain.com
TEAM_NOTIFICATION_EMAIL=support@yourdomain.com

# Azure DevOps (Optional)
AZDO_ORG_URL=https://dev.azure.com/yourorg
AZDO_PAT=your-personal-access-token
AZDO_PROJECT=your-project-name

# API Configuration
API_PORT=4000
API_URL=https://support.yourdomain.com
NEXT_PUBLIC_API_URL=https://support.yourdomain.com/api
```

### Step 7: Start Docker Services

```bash
# Start PostgreSQL and Redis
cd /opt/support-portal
docker compose -f docker-compose.prod.yml up -d

# Verify services are running
docker ps
```

### Step 8: Setup Database

```bash
cd /opt/support-portal/apps/api

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# (Optional) Seed with initial data
npx prisma db seed
```

### Step 9: Build Application

```bash
cd /opt/support-portal

# Build all packages
npm run build

# Verify builds
ls -la apps/web/.next
ls -la apps/api/dist
```

### Step 10: Configure PM2

Create `/opt/support-portal/ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: 'support-portal-api',
      cwd: '/opt/support-portal/apps/api',
      script: 'dist/index.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
      error_file: '/var/log/support-portal/api-error.log',
      out_file: '/var/log/support-portal/api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    },
    {
      name: 'support-portal-web',
      cwd: '/opt/support-portal/apps/web',
      script: 'node_modules/.bin/next',
      args: 'start',
      instances: 1,
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: '/var/log/support-portal/web-error.log',
      out_file: '/var/log/support-portal/web-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
};
```

Start applications:

```bash
# Create log directory
sudo mkdir -p /var/log/support-portal
sudo chown $USER:$USER /var/log/support-portal

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup systemd
# Run the command it outputs

# Verify apps are running
pm2 status
pm2 logs
```

### Step 11: Configure Nginx

Create `/etc/nginx/sites-available/support-portal`:

```nginx
# Upstream definitions
upstream frontend {
    server localhost:3000;
    keepalive 64;
}

upstream backend {
    server localhost:4000;
    keepalive 64;
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name support.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS Server
server {
    listen 443 ssl http2;
    server_name support.yourdomain.com;

    # SSL Configuration (will be added by Certbot)
    # ssl_certificate /etc/letsencrypt/live/support.yourdomain.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/support.yourdomain.com/privkey.pem;
    # include /etc/letsencrypt/options-ssl-nginx.conf;
    # ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Logging
    access_log /var/log/nginx/support-portal-access.log;
    error_log /var/log/nginx/support-portal-error.log;

    # Max upload size
    client_max_body_size 25M;

    # Frontend (Next.js)
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Backend API
    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # WebSocket
    location /socket.io {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        
        # WebSocket specific timeouts
        proxy_connect_timeout 7d;
        proxy_send_timeout 7d;
        proxy_read_timeout 7d;
    }

    # Static files caching
    location /_next/static {
        proxy_pass http://frontend;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, max-age=3600, immutable";
    }

    # Uploads (if using local storage)
    location /uploads {
        alias /opt/support-portal/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable site and test:

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/support-portal /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### Step 12: Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d support.yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

Certbot will automatically:
- Obtain SSL certificate
- Update Nginx configuration
- Setup auto-renewal

### Step 13: Setup Firewall

```bash
# Install UFW if not installed
sudo apt-get install -y ufw

# Configure firewall
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# Verify
sudo ufw status
```

## 📊 Monitoring & Maintenance

### PM2 Management

```bash
# View status
pm2 status

# View logs
pm2 logs
pm2 logs support-portal-api
pm2 logs support-portal-web

# Restart apps
pm2 restart all
pm2 restart support-portal-api

# Stop apps
pm2 stop all

# Delete apps from PM2
pm2 delete all

# Monitor resources
pm2 monit
```

### Nginx Management

```bash
# Check status
sudo systemctl status nginx

# View logs
sudo tail -f /var/log/nginx/support-portal-access.log
sudo tail -f /var/log/nginx/support-portal-error.log

# Test configuration
sudo nginx -t

# Reload configuration
sudo systemctl reload nginx

# Restart Nginx
sudo systemctl restart nginx
```

### Docker Management

```bash
# View running containers
docker ps

# View logs
docker logs support-portal-postgres-prod
docker logs support-portal-redis-prod

# Restart containers
docker restart support-portal-postgres-prod
docker restart support-portal-redis-prod

# Stop all containers
docker compose -f docker-compose.prod.yml down

# Start all containers
docker compose -f docker-compose.prod.yml up -d
```

## 🔄 Updates & Upgrades

### Deploying Updates

```bash
cd /opt/support-portal

# Pull latest changes
git pull origin main

# Install new dependencies
npm ci

# Run new migrations
cd apps/api && npx prisma migrate deploy && cd ../..

# Rebuild
npm run build

# Restart applications
pm2 restart all

# Verify
pm2 status
pm2 logs --lines 50
```

### Database Backups

```bash
# Backup database
docker exec support-portal-postgres-prod pg_dump -U postgres support_portal > backup-$(date +%Y%m%d-%H%M%S).sql

# Restore database
docker exec -i support-portal-postgres-prod psql -U postgres support_portal < backup-20240101-120000.sql

# Automated daily backups (add to crontab)
0 2 * * * docker exec support-portal-postgres-prod pg_dump -U postgres support_portal > /backups/support-portal-$(date +\%Y\%m\%d).sql
```

## 🔧 Troubleshooting

### Application Not Starting

```bash
# Check PM2 logs
pm2 logs

# Check if ports are in use
sudo lsof -i :3000
sudo lsof -i :4000

# Verify environment variables
pm2 env <id>

# Check disk space
df -h

# Check memory
free -h
```

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# View PostgreSQL logs
docker logs support-portal-postgres-prod

# Test connection
docker exec -it support-portal-postgres-prod psql -U postgres

# Verify DATABASE_URL in .env
```

### Nginx 502 Bad Gateway

```bash
# Check if apps are running
pm2 status

# Check Nginx logs
sudo tail -f /var/log/nginx/support-portal-error.log

# Verify upstream servers
curl http://localhost:3000
curl http://localhost:4000/api/health

# Test Nginx config
sudo nginx -t
```

### SSL Certificate Issues

```bash
# Check certificate expiry
sudo certbot certificates

# Renew certificate manually
sudo certbot renew

# Force renew
sudo certbot renew --force-renewal
```

## 📈 Performance Optimization

### Enable Caching

Add to Nginx configuration:

```nginx
# Cache zone
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=10g inactive=60m use_temp_path=off;

# In location blocks
proxy_cache my_cache;
proxy_cache_valid 200 60m;
proxy_cache_use_stale error timeout http_500 http_502 http_503;
```

### Database Optimization

```sql
-- Create indexes for frequent queries
CREATE INDEX idx_tickets_status ON "Ticket"(status);
CREATE INDEX idx_tickets_created_at ON "Ticket"("createdAt");
CREATE INDEX idx_responses_ticket_id ON "Response"("ticketId");
```

### Redis Configuration

Edit `docker-compose.prod.yml`:

```yaml
redis:
  command: redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru
```

## 🆘 Support

If you encounter issues:

1. Check logs: `pm2 logs`, `sudo tail -f /var/log/nginx/error.log`
2. Verify environment configuration
3. Check GitHub Issues
4. Contact: support@swyftops.com

---

**Deployment Complete! 🎉**
