# 🔧 Database Troubleshooting Guide

Complete guide to resolve "Database operation failed" and other database-related errors.

## 🚨 Common Database Errors

### "Database operation failed"
**Symptoms:** Application crashes with database errors
**Causes:** Connection issues, missing environment variables, schema problems

### "Can't reach database server"
**Symptoms:** Connection timeout errors
**Causes:** Invalid DATABASE_URL, network issues, database server down

### "Prisma client not generated"
**Symptoms:** Import errors for PrismaClient
**Causes:** Missing `node_modules/.prisma` directory

## 🛠️ Quick Fix Commands

### 1. Run Comprehensive Check
```bash
npm run troubleshoot
```
This checks:
- Environment variables
- Prisma setup
- Dependencies
- Database connectivity

### 2. Auto-Fix Common Issues
```bash
npm run fix:vercel
```
This automatically fixes:
- Missing dependencies
- Prisma configuration
- Environment setup
- Database schema

### 3. Test Database Connection
```bash
npm run test:db
```
This tests:
- Database connectivity
- Query execution
- Table access

### 4. Check Deployment Readiness
```bash
npm run test:vercel
```
This verifies:
- Vercel configuration
- Environment variables
- Build process

## 📋 Step-by-Step Troubleshooting

### Step 1: Check Environment Variables

```bash
# Check if DATABASE_URL is set
node -e "console.log(process.env.DATABASE_URL || 'NOT SET')"

# Check all required variables
npm run env:setup vercel
```

**Common Issues:**
- `DATABASE_URL` not set
- Invalid database URL format
- Missing Vercel environment variables

**Solutions:**
```bash
# For local development
echo 'DATABASE_URL="file:./dev.db"' > .env.local

# For Vercel (PlanetScale)
echo 'DATABASE_URL="mysql://user:pass@host:port/db?sslaccept=strict"' > .env.vercel
```

### Step 2: Fix Prisma Setup

```bash
# Generate Prisma client
npm run db:generate

# Check if client was generated
ls -la node_modules/.prisma/

# Regenerate if needed
npx prisma generate --force
```

**Common Issues:**
- Prisma client not generated
- Outdated Prisma client
- Schema changes not reflected

### Step 3: Database Schema Issues

```bash
# Push schema to database
npm run db:push

# Reset database (⚠️  DELETES ALL DATA)
npx prisma migrate reset --force

# Create new migration
npx prisma migrate dev --name init
```

**Common Issues:**
- Schema not pushed to database
- Migration conflicts
- Database schema mismatch

### Step 4: Database Connection Issues

```bash
# Test connection
npm run test:db

# Check database URL format
node -e "
const url = process.env.DATABASE_URL;
console.log('URL:', url);
console.log('Valid format:', url && (url.startsWith('mysql://') || url.startsWith('file:')));
"
```

**For PlanetScale:**
```bash
# Get connection string from PlanetScale dashboard
# Should look like: mysql://user:pass@host:port/db?sslaccept=strict

# Test with PlanetScale CLI
pscale shell your-database main
```

**For Local MySQL:**
```bash
# Test MySQL connection
mysql -h localhost -u user -p database -e "SELECT 1"

# Check MySQL service
sudo systemctl status mysql
```

## 🌐 Vercel-Specific Issues

### Environment Variables in Vercel

1. **Go to Vercel Dashboard**
2. **Select your project**
3. **Go to Settings → Environment Variables**
4. **Add required variables:**

```env
DATABASE_URL=mysql://username:password@host:port/database?sslaccept=strict
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-super-secret-key-here
```

### Vercel Build Issues

```bash
# Check build logs in Vercel dashboard
# Common issues:
# - Missing Prisma generate in build command
# - Missing mysql2 dependency
# - Environment variables not set
```

**Fix build command in Vercel:**
```
Build Command: prisma generate && npm run build
```

### Cold Start Issues

**Symptoms:** App works after deployment but fails on first load

**Solutions:**
1. **Enable connection pooling** in PlanetScale
2. **Use connection limits** in Prisma config
3. **Add retry logic** for database connections

## 🐳 Docker Issues

### Docker Database Connection

```bash
# Check Docker containers
docker ps

# Check database logs
docker logs crm-erp-db

# Test connection from container
docker exec -it crm-erp-app npm run test:db
```

### Docker Environment Variables

```bash
# Check environment in container
docker exec crm-erp-app env | grep DATABASE

# Check if .env file is mounted
docker exec crm-erp-app ls -la .env*
```

## 🔍 Advanced Debugging

### Prisma Studio

```bash
# Open Prisma Studio
npm run db:studio

# Check database content
# Verify table structure
# Test queries manually
```

### Database Logs

```bash
# Enable Prisma query logging
node -e "
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient({ log: ['query', 'error'] })
// Test your queries here
"
```

### Network Debugging

```bash
# Test database connectivity
telnet your-host your-port

# Check DNS resolution
nslookup your-database-host

# Test SSL connection
openssl s_client -connect your-host:your-port
```

## 🚨 Emergency Fixes

### Complete Database Reset

```bash
# ⚠️  WARNING: This deletes all data
npm run db:migrate reset --force
npm run db:push
npm run db:seed
```

### Reinstall Dependencies

```bash
rm -rf node_modules package-lock.json
npm install
npm run db:generate
```

### Clean Vercel Deployment

```bash
# Force new deployment
git commit --allow-empty -m "Force redeploy"
git push
```

## 📊 Error Code Reference

| Error Code | Description | Solution |
|------------|-------------|----------|
| P1001 | Database server unreachable | Check DATABASE_URL and network |
| P1008 | Operations timed out | Increase timeout, check connection |
| P1017 | Server closed connection | Enable connection pooling |
| P2028 | Transaction API error | Check database permissions |
| P3000 | Failed to create database | Check database permissions |

## 🆘 Getting Help

### Quick Diagnosis Script
```bash
npm run troubleshoot
```

### Generate Support Report
```bash
node troubleshoot.js > support-report.txt
```

### Community Support
- **GitHub Issues:** Report bugs with full error logs
- **Prisma Discord:** Get help with Prisma-specific issues
- **Vercel Community:** Deployment and hosting questions

### Professional Support
- **PlanetScale Support:** Database-specific issues
- **Vercel Support:** Deployment and hosting issues
- **Prisma Support:** ORM and database schema issues

## 🎯 Prevention Best Practices

### Development
- Always test database operations locally
- Use environment-specific databases
- Keep database schemas versioned
- Regular backup testing

### Production
- Monitor database performance
- Set up automated backups
- Use connection pooling
- Implement proper error handling

### Deployment
- Test deployments in staging first
- Use environment-specific configurations
- Monitor cold start performance
- Set up proper logging

---

## 🚀 Quick Reference

```bash
# Check everything
npm run troubleshoot

# Fix common issues
npm run fix:vercel

# Test database
npm run test:db

# Check Vercel readiness
npm run test:vercel

# Setup environment
npm run env:setup vercel
```

**Remember:** Most database issues are caused by incorrect environment variables or missing Prisma client generation. The troubleshooting scripts will identify and fix 90% of common issues automatically! 🎉
