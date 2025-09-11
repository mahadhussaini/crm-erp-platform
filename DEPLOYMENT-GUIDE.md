# 🚀 CRM/ERP Platform Deployment Guide

This comprehensive guide covers everything you need to deploy the CRM/ERP platform to various environments.

## 📋 Prerequisites

### System Requirements
- **Node.js**: 18.x or higher
- **Docker**: 20.x or higher (for containerized deployment)
- **PostgreSQL**: 15.x or higher
- **Redis**: 7.x or higher (optional, for caching)

### Required Services
- Domain name (for production)
- SSL certificate (Let's Encrypt or purchased)
- SMTP server (for email notifications)
- Payment processor (Stripe for payments)
- SMS service (Twilio for messaging)

## 🐳 Docker Deployment (Recommended)

### Quick Start with Docker Compose

1. **Clone and navigate to the project:**
```bash
git clone <repository-url>
cd crm-erp-platform
```

2. **Configure environment variables:**
```bash
cp environment-config.md .env.local
# Edit .env.local with your actual values
nano .env.local
```

3. **Deploy with development configuration:**
```bash
./deploy.sh development
```

4. **Deploy with production configuration:**
```bash
./deploy.sh production
```

### Manual Docker Deployment

```bash
# Build the application
docker build -t crm-erp-platform .

# Run with docker-compose
docker-compose -f docker-compose.yml up -d

# Check logs
docker-compose logs -f app
```

## ☁️ Cloud Platform Deployments

### Vercel (Recommended - Easiest Setup)

**📖 [Detailed Vercel Deployment Guide](VERCEL-DEPLOYMENT.md)**

1. **Connect your repository:**
   - Import project from GitHub
   - Configure build settings

2. **Environment variables:**
   - Add all variables from `environment-config.md`
   - Configure database connection

3. **Database setup:**
   - Use Vercel Postgres or external PostgreSQL
   - Configure connection string

### Railway

1. **Create new project:**
   - Connect GitHub repository
   - Choose Node.js template

2. **Database setup:**
   - Add PostgreSQL plugin
   - Configure environment variables

3. **Deploy:**
```bash
npm run build
npm run start
```

### Render

1. **Create web service:**
   - Connect GitHub repository
   - Choose Node.js runtime

2. **Configure settings:**
   - Build command: `npm run build`
   - Start command: `npm run start`
   - Add environment variables

### AWS EC2

1. **Launch EC2 instance:**
```bash
# Ubuntu 22.04 LTS recommended
aws ec2 run-instances \
  --image-id ami-0abcdef1234567890 \
  --instance-type t3.medium \
  --key-name your-key-pair
```

2. **Install dependencies:**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Docker
sudo apt-get install -y docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker
```

3. **Deploy application:**
```bash
# Clone repository
git clone <repository-url>
cd crm-erp-platform

# Configure environment
cp environment-config.md .env.local
nano .env.local

# Deploy
./deploy.sh production
```

## 🗄️ Database Setup

### SQLite Configuration

1. **SQLite Setup (No additional setup required):**
SQLite is a file-based database that doesn't require a separate server process. The database file will be created automatically when you run migrations.

```env
DATABASE_URL="file:./dev.db"  # Development
DATABASE_URL="file:/app/data/prod.db"  # Production
```

2. **Docker SQLite:**
```yaml
# SQLite doesn't need a separate container
# Database file will be stored in a Docker volume
app:
  volumes:
    - sqlite_data:/app/data
  environment:
    - DATABASE_URL=file:/app/data/prod.db
```

3. **Backup Strategy:**
   Since SQLite is file-based, implement regular backups:
   ```bash
   # Daily backup script
   cp /app/data/prod.db /backups/$(date +\%Y\%m\%d)_backup.db

   # Compress backups
   gzip /backups/$(date +\%Y\%m\%d)_backup.db
   ```

### Database Migration

```bash
# Generate Prisma client
npm run db:generate

# Run migrations (SQLite will create the database file automatically)
npm run db:migrate

# Push schema changes (alternative to migrations for SQLite)
npm run db:push

# Seed database (optional)
npm run db:seed
```

**Note:** For SQLite, you can use either migrations (`npm run db:migrate`) or direct schema push (`npm run db:push`). The push method is simpler for SQLite but doesn't support rollbacks.

## 🔒 Security Configuration

### SSL/TLS Setup

#### Let's Encrypt (Free)
```bash
# Install Certbot
sudo apt-get install certbot

# Get certificate
sudo certbot certonly --standalone -d yourdomain.com

# Configure Nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
}
```

#### Purchased SSL Certificate
- Upload certificate files to server
- Configure Nginx with certificate paths
- Set up automatic renewal if applicable

### Firewall Configuration

```bash
# UFW (Ubuntu)
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw allow 3000 # Application port

# AWS Security Groups
# Allow inbound traffic on ports 22, 80, 443, 3000
```

### Environment Security

1. **Never commit secrets to version control**
2. **Use environment-specific secrets**
3. **Rotate secrets regularly**
4. **Enable 2FA for admin accounts**
5. **Monitor for suspicious activity**

## 📊 Monitoring & Maintenance

### Application Monitoring

1. **Health Checks:**
```bash
# Application health
curl https://yourdomain.com/api/health

# Database connectivity
curl https://yourdomain.com/api/health | jq .database
```

2. **Logs:**
```bash
# Docker logs
docker-compose logs -f app

# Application logs
tail -f /var/log/crm-erp/app.log
```

3. **Performance Monitoring:**
   - Set up APM (Application Performance Monitoring)
   - Monitor response times and error rates
   - Configure alerts for downtime

### Database Maintenance

```bash
# Backup database
pg_dump crm_erp_db > backup.sql

# Restore database
psql crm_erp_db < backup.sql

# Database optimization
REINDEX DATABASE crm_erp_db;
VACUUM ANALYZE;
```

### Backup Strategy

1. **Automated Backups:**
```bash
# Daily database backup
0 2 * * * pg_dump crm_erp_db > /backups/$(date +\%Y\%m\%d)_backup.sql

# File system backup
0 3 * * * rsync -av /app/uploads /backups/files/
```

2. **Offsite Backup:**
   - AWS S3 or Google Cloud Storage
   - Automated upload scripts
   - Retention policies (30 days, 90 days, etc.)

## 🔄 Updates & Maintenance

### Application Updates

```bash
# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Run database migrations
npm run db:migrate

# Build and restart
npm run build
docker-compose restart app
```

### Zero-Downtime Deployment

1. **Blue-Green Deployment:**
```bash
# Start new version
docker-compose up -d app_green

# Switch traffic (using load balancer)
# nginx config update

# Stop old version
docker-compose stop app_blue
```

2. **Rolling Updates:**
```bash
# Update with zero downtime
docker-compose up -d --scale app=2
docker-compose up -d --scale app=1
```

## 🚨 Troubleshooting

### Common Issues

1. **Application won't start:**
```bash
# Check logs
docker-compose logs app

# Check environment variables
docker-compose exec app env

# Check database connectivity
docker-compose exec app npm run db:studio
```

2. **Database connection errors:**
```bash
# Check if SQLite database file exists
ls -la *.db

# Test database connection
npm run db:studio

# Check database file permissions
ls -la dev.db
```

3. **Memory issues:**
```bash
# Monitor memory usage
docker stats

# Increase container memory limits
docker-compose.yml:
services:
  app:
    deploy:
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M
```

4. **SSL certificate issues:**
```bash
# Check certificate validity
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com

# Renew Let's Encrypt certificate
sudo certbot renew
```

### Performance Optimization

1. **Database Optimization:**
```sql
-- Create indexes for frequently queried columns
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_orders_created_at ON orders(created_at);
```

2. **Application Optimization:**
```javascript
// Enable compression
const compression = require('compression')
app.use(compression())

// Cache static assets
app.use(express.static('public', { maxAge: '1y' }))

// Database connection pooling
const { Pool } = require('pg')
const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000,
})
```

3. **CDN Integration:**
   - Use CloudFront, Cloudflare for static assets
   - Implement caching strategies
   - Compress responses

## 📞 Support & Monitoring

### Monitoring Tools

1. **Uptime Monitoring:**
   - Pingdom, UptimeRobot
   - Configure alerts for downtime

2. **Error Tracking:**
   - Sentry for error monitoring
   - LogRocket for user session replay

3. **Performance Monitoring:**
   - New Relic, DataDog
   - Application Insights

### Support Channels

- **Documentation**: Check this guide first
- **GitHub Issues**: Report bugs and request features
- **Community Forum**: Ask questions and share solutions
- **Professional Support**: Contact for enterprise support

## 🎯 Best Practices

### Security
- Regular security updates
- Least privilege access
- Regular backup testing
- Security headers enabled

### Performance
- Monitor resource usage
- Optimize database queries
- Implement caching strategies
- Regular performance testing

### Reliability
- Automated testing and deployment
- Monitoring and alerting
- Disaster recovery plan
- Regular backup verification

### Scalability
- Horizontal scaling capabilities
- Database optimization
- CDN integration
- Microservices architecture ready

---

## 🚀 Going Live Checklist

- [ ] Domain configured and DNS propagated
- [ ] SSL certificate installed and working
- [ ] Environment variables configured
- [ ] Database migrated and seeded
- [ ] Application deployed and running
- [ ] Health checks passing
- [ ] Monitoring and alerts configured
- [ ] Backup strategy implemented
- [ ] Security measures in place
- [ ] Performance tested
- [ ] Documentation updated

**Your CRM/ERP platform is now ready for production! 🎉**
