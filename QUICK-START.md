# 🚀 Quick Start Guide - CRM/ERP Platform

## ❌ Resolving "Configuration 500 Error"

If you're seeing `GET http://localhost:3000/api/auth/error?error=Configuration 500 (Internal Server Error)`, follow these steps to resolve it:

### Step 1: Set Up Environment Variables

```bash
# Run the environment setup script
npm run env:setup
```

This will create a `.env.local` file with properly configured environment variables.

### Step 2: Verify Environment Variables

Check that your `.env.local` file contains:
```env
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-generated-secret-here"
DATABASE_URL="postgresql://crm_user:crm_password@localhost:5432/crm_erp_db"
```

### Step 3: Set Up Database

```bash
# Option 1: Using Docker (Recommended)
docker run --name crm-erp-postgres -e POSTGRES_DB=crm_erp_db -e POSTGRES_USER=crm_user -e POSTGRES_PASSWORD=crm_password -p 5432:5432 -d postgres:15

# Option 2: Install PostgreSQL locally
# Follow instructions for your OS to install PostgreSQL
```

### Step 4: Initialize Database

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed database with sample data
npm run db:seed
```

### Step 5: Start Development Server

```bash
npm run dev
```

## 📋 Default Login Credentials

After setup, you can login with:

- **Admin**: `admin@crm-erp.com` / `admin123`
- **Manager**: `manager@crm-erp.com` / `manager123`
- **Employee**: `employee@crm-erp.com` / `employee123`

## 🔧 Troubleshooting

### "Database connection failed"
1. Make sure PostgreSQL is running
2. Check DATABASE_URL in `.env.local`
3. Verify database credentials

### "NEXTAUTH_SECRET not found"
1. Run `npm run env:setup` to generate secrets
2. Or manually set NEXTAUTH_SECRET to a random 32-character string

### "NEXTAUTH_URL not set"
1. For development: `NEXTAUTH_URL="http://localhost:3000"`
2. For production: `NEXTAUTH_URL="https://yourdomain.com"`

### Port 3000 already in use
```bash
# Kill process using port 3000
npx kill-port 3000

# Or use a different port
npm run dev -- -p 3001
```

## 🎯 Quick Development Setup (One Command)

```bash
# Complete setup in one command
chmod +x setup.sh && ./setup.sh setup
```

This will:
- Install dependencies
- Set up environment variables
- Configure database
- Start development server

## 🌐 Production Deployment

### Using Docker
```bash
# Build and run production containers
docker-compose up --build -d
```

### Manual Deployment
```bash
# Build for production
npm run build

# Start production server
npm run start
```

## 📚 Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server

# Database
npm run db:generate      # Generate Prisma client
npm run db:migrate       # Run database migrations
npm run db:push          # Push schema changes
npm run db:seed          # Seed database
npm run db:studio        # Open Prisma Studio

# Environment
npm run env:setup        # Set up environment variables

# Docker
npm run docker:dev       # Start development with Docker
npm run docker:prod      # Start production with Docker
npm run docker:stop      # Stop Docker containers
npm run docker:logs      # View Docker logs

# Deployment
npm run deploy:dev       # Deploy to development
npm run deploy:prod      # Deploy to production
```

## 🔍 Common Issues & Solutions

### Issue: "Cannot find module" errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Prisma client not generated"
```bash
npm run db:generate
npm run db:migrate
```

### Issue: "Port already in use"
```bash
# Find and kill process
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

### Issue: "Database schema not up to date"
```bash
npm run db:migrate
npm run db:generate
```

## 📞 Support

If you continue to have issues:

1. Check the console logs for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure database is running and accessible
4. Check that all dependencies are installed
5. Try clearing browser cache and cookies

## 🎉 Success!

Once setup is complete, you'll have a fully functional CRM/ERP platform with:

- ✅ User authentication and authorization
- ✅ Role-based access control
- ✅ Complete CRM functionality
- ✅ Full ERP system
- ✅ Admin dashboard
- ✅ API integrations
- ✅ Production-ready deployment

**Your CRM/ERP platform is now ready to use! 🚀**
