# 🚨 Vercel Database Connection Fix Guide

## Problem: 500 Internal Server Error on Registration

**Error:** `POST https://crm-erp-platform.vercel.app/api/auth/register 500 (Internal Server Error)`
**Response:** `{"error":"Database connection error","details":"Please try again later"}`

## 🔍 Root Cause Analysis

The issue is likely one of the following:

1. **Missing/Incorrect DATABASE_URL** in Vercel environment variables
2. **PlanetScale database not properly configured** for Vercel
3. **Prisma client not generated** during Vercel build
4. **MySQL connection issues** in serverless environment
5. **Database schema not pushed** to PlanetScale

## ✅ Step-by-Step Fix

### Step 1: Check Current Vercel Configuration

1. **Go to Vercel Dashboard** → Your Project → Settings → Environment Variables
2. **Verify DATABASE_URL** is set correctly:
   ```
   DATABASE_URL=mysql://username:password@host:port/database?sslaccept=strict
   ```
3. **Check other required variables:**
   ```
   NEXTAUTH_URL=https://your-app-name.vercel.app
   NEXTAUTH_SECRET=your-super-secret-key-here
   ```

### Step 2: Set Up PlanetScale Database (If Not Done)

1. **Create PlanetScale Account:**
   - Go to [planetscale.com](https://planetscale.com)
   - Sign up for free tier
   - Create a new database

2. **Get Connection String:**
   - Go to your database dashboard
   - Click "Connect"
   - Choose "Prisma" connection method
   - Copy the connection string

3. **Push Schema to PlanetScale:**
   ```bash
   # Update your local DATABASE_URL
   echo "DATABASE_URL=\"your-planetscale-connection-string\"" > .env.local

   # Generate Prisma client
   npx prisma generate

   # Push schema to PlanetScale
   npx prisma db push
   ```

### Step 3: Update Vercel Environment Variables

1. **Go to Vercel Dashboard** → Project Settings → Environment Variables
2. **Add/Update these variables:**

   **Required:**
   ```env
   DATABASE_URL=mysql://username:password@host:port/database?sslaccept=strict
   NEXTAUTH_URL=https://your-app-name.vercel.app
   NEXTAUTH_SECRET=your-super-secret-key-here
   ```

   **Optional (for integrations):**
   ```env
   STRIPE_SECRET_KEY=sk_test_...
   TWILIO_ACCOUNT_SID=AC...
   TWILIO_AUTH_TOKEN=...
   ```

3. **Important:** Make sure the DATABASE_URL is exactly as provided by PlanetScale

### Step 4: Redeploy to Vercel

1. **Trigger New Deployment:**
   - Go to Vercel Dashboard
   - Click "Deployments" tab
   - Click "Redeploy" or push new code

2. **Check Build Logs:**
   - Click on the deployment
   - Check "Build Logs" tab
   - Look for Prisma generation and build errors

### Step 5: Test the Fix

1. **Test Database Connection:**
   ```
   curl https://your-app-name.vercel.app/api/test-db
   ```

2. **Test Registration:**
   ```
   curl -X POST https://your-app-name.vercel.app/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test User",
       "email": "test@example.com",
       "password": "password123"
     }'
   ```

3. **Check Vercel Function Logs:**
   - Go to Vercel Dashboard → Functions
   - Click on the failing function
   - Check logs for detailed error messages

## 🔧 Advanced Troubleshooting

### If Database Connection Still Fails

1. **Check Database URL Format:**
   ```bash
   # Test locally first
   echo $DATABASE_URL | grep -E "mysql://.*:.*@.*:.*\/.*\?sslaccept=strict"
   ```

2. **Verify PlanetScale Connection:**
   ```bash
   # Test connection with a simple client
   mysql -h your-host -u username -p -e "SELECT 1;"
   ```

3. **Check PlanetScale Firewall:**
   - Go to PlanetScale Dashboard
   - Settings → Firewall
   - Ensure Vercel's IP ranges are allowed (or disable firewall temporarily for testing)

### If Prisma Client Issues

1. **Force Prisma Client Regeneration:**
   ```bash
   rm -rf node_modules/.prisma
   npx prisma generate --force
   ```

2. **Check Vercel Build Command:**
   Ensure `vercel.json` has:
   ```json
   {
     "buildCommand": "prisma generate && npm run build"
   }
   ```

### If Environment Variables Issues

1. **Redeploy After Environment Changes:**
   - Environment variable changes require a new deployment
   - Go to Vercel Dashboard → Deployments → Redeploy

2. **Check Variable Values:**
   - Make sure no extra spaces or quotes
   - Use the exact connection string from PlanetScale

## 📊 Common Error Patterns

### Error: "Can't reach database server"
```
✅ Fix: Check DATABASE_URL format and PlanetScale connection
```

### Error: "Prisma client not found"
```
✅ Fix: Ensure "prisma generate" runs in build command
```

### Error: "Access denied for user"
```
✅ Fix: Check PlanetScale credentials and permissions
```

### Error: "SSL connection error"
```
✅ Fix: Ensure ?sslaccept=strict is in DATABASE_URL
```

## 🚀 Quick Fix Commands

```bash
# 1. Set up environment variables
node env-setup.js vercel

# 2. Test database locally
npm run db:generate
npm run db:push
npm run dev

# 3. Test deployed database
curl https://your-app.vercel.app/api/test-db

# 4. Test registration
curl -X POST https://your-app.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"test123"}'

# 5. Check deployment status
npm run deploy:status

# 6. Run full troubleshooting
npm run troubleshoot
```

## 📞 Need More Help?

1. **Check Vercel Logs:**
   - Dashboard → Functions → Click failing function → View logs

2. **Test Locally First:**
   ```bash
   # Set up local environment
   node env-setup.js vercel
   npm run dev

   # Test registration locally
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name":"Test","email":"test@example.com","password":"test123"}'
   ```

3. **Get Support:**
   - **Vercel Support:** Dashboard → Support
   - **PlanetScale Support:** Dashboard → Help
   - **GitHub Issues:** Report in your repository

## 🎯 Success Checklist

- [ ] DATABASE_URL set correctly in Vercel
- [ ] PlanetScale database created and accessible
- [ ] Prisma schema pushed to database
- [ ] Vercel deployment successful (green checkmark)
- [ ] `/api/test-db` returns success
- [ ] Registration API works (`/api/auth/register`)
- [ ] User can sign up and sign in

**Once all checks pass, your CRM/ERP platform will be fully functional on Vercel! 🚀**
