# 🔧 Fixing 500 Internal Server Error on Vercel

Complete troubleshooting guide for resolving the 500 error on your CRM/ERP platform deployed to Vercel.

## 🚨 Quick Diagnosis

### Step 1: Check Vercel Function Logs
1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Click on "Functions" tab
4. Find the failing `/api/auth/register` function
5. Click on it to see the detailed error logs

### Step 2: Check Environment Variables
The most common cause of 500 errors is missing or incorrect environment variables.

## 🔧 Most Common Fixes

### Fix 1: Environment Variables (Most Likely Cause)

**Check your Vercel environment variables:**

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Ensure these variables are set:

```env
DATABASE_URL=mysql://username:password@host:port/database?sslaccept=strict
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=your-super-secret-key-here
```

**How to get PlanetScale DATABASE_URL:**
1. Go to [PlanetScale Dashboard](https://planetscale.com)
2. Select your database
3. Click "Connect"
4. Choose "Prisma" connection method
5. Copy the full connection string

### Fix 2: Database Schema Not Applied

**Apply database schema to PlanetScale:**

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Or create and run migration
npx prisma migrate dev --name init
```

### Fix 3: Vercel Build Issues

**Force a clean rebuild:**

1. Go to Vercel Dashboard → Your Project → Settings → Git
2. Scroll down to "Deployments"
3. Click "Trigger Deployment"
4. Or push an empty commit to trigger rebuild:

```bash
git commit --allow-empty -m "Trigger Vercel rebuild"
git push
```

## 🔍 Detailed Troubleshooting

### Check Database Connection

Create a test API route to verify database connectivity:

```javascript
// src/app/api/test-db/route.ts
import { NextResponse } from "next/server"
import { checkDatabaseHealth } from "@/lib/db"

export async function GET() {
  const health = await checkDatabaseHealth()
  return NextResponse.json(health)
}
```

Then visit `https://your-app.vercel.app/api/test-db`

### Check Environment Variables

Create a test API route to verify environment variables:

```javascript
// src/app/api/test-env/route.ts
import { NextResponse } from "next/server"

export async function GET() {
  const env = {
    DATABASE_URL: process.env.DATABASE_URL ? "Set" : "Missing",
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ? "Set" : "Missing",
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "Set" : "Missing",
    NODE_ENV: process.env.NODE_ENV
  }
  return NextResponse.json(env)
}
```

Then visit `https://your-app.vercel.app/api/test-env`

## 🛠️ Automated Troubleshooting

### Use the Troubleshooting Script

```bash
# Run comprehensive troubleshooting
npm run troubleshoot all

# Or run specific checks
npm run troubleshoot db      # Database issues
npm run troubleshoot env     # Environment variables
npm run troubleshoot build   # Build issues
```

### Check Deployment Status

```bash
# Check deployment readiness
npm run deploy:status
```

## 🔄 Step-by-Step Resolution

### Step 1: Verify Environment Variables

1. **In Vercel Dashboard:**
   - Go to Project Settings → Environment Variables
   - Ensure all required variables are set
   - Check that DATABASE_URL is the full PlanetScale connection string

2. **Test locally first:**
   ```bash
   # Create .env.local with production values
   cp .env.example .env.local
   # Edit with your PlanetScale DATABASE_URL

   # Test locally
   npm run dev
   # Try the registration endpoint
   ```

### Step 2: Apply Database Schema

1. **Update your local schema:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

2. **Commit and push changes:**
   ```bash
   git add .
   git commit -m "Fix: Apply database schema for production"
   git push
   ```

### Step 3: Verify Vercel Configuration

1. **Check vercel.json:**
   ```json
   {
     "buildCommand": "prisma generate && npm run build",
     "functions": {
       "src/app/api/**/*.ts": {
         "maxDuration": 30,
         "memory": 1024
       }
     }
   }
   ```

2. **Redeploy:**
   - Push changes to trigger automatic redeploy
   - Or manually trigger deployment in Vercel dashboard

## 📊 Error-Specific Solutions

### Error: "Database connection failed"

**Cause:** DATABASE_URL is incorrect or database is unreachable

**Solution:**
1. Verify PlanetScale connection string format
2. Check database firewall settings
3. Ensure SSL connection (`sslaccept=strict`)

### Error: "NEXTAUTH_SECRET is not configured"

**Cause:** Missing NextAuth configuration

**Solution:**
1. Generate a secure secret: `openssl rand -base64 32`
2. Add to Vercel environment variables
3. Redeploy application

### Error: "Prisma client not generated"

**Cause:** Prisma client not built during deployment

**Solution:**
1. Update vercel.json buildCommand to include `prisma generate`
2. Push changes and redeploy
3. Check Vercel build logs for Prisma errors

### Error: "Validation error" or "Database operation failed"

**Cause:** Database schema mismatch or validation issues

**Solution:**
1. Run `npx prisma db push` to apply latest schema
2. Check API request format and data types
3. Verify enum values match database schema

## 🐛 Debugging Tools

### Vercel Function Logs

1. Go to Vercel Dashboard → Functions tab
2. Click on the failing function
3. Check error messages and stack traces
4. Look for specific error codes (P1001, P2002, etc.)

### Local Debugging

```bash
# Test with production environment variables
DATABASE_URL="your-production-db-url" npm run dev

# Test API endpoints locally
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"password123"}'
```

### Database Debugging

```bash
# Test database connection
npx prisma studio

# Check database schema
npx prisma db push --preview-feature

# View migration history
npx prisma migrate status
```

## 🚀 Preventive Measures

### 1. Environment Variables
- Always use Vercel's environment variable management
- Never commit `.env.local` to version control
- Use different values for development/production

### 2. Database Management
- Always test schema changes locally first
- Use `npx prisma db push` for schema updates in development
- Monitor PlanetScale query performance

### 3. Deployment Process
- Test locally before deploying to production
- Use preview deployments for testing
- Monitor Vercel function logs regularly

## 📞 Getting Help

### Quick Support Checklist
- [ ] Environment variables are set in Vercel
- [ ] DATABASE_URL is the full PlanetScale connection string
- [ ] Database schema is applied (`npx prisma db push`)
- [ ] Vercel functions have sufficient memory (1024MB)
- [ ] Build command includes `prisma generate`

### Support Resources
- **Vercel Documentation:** [vercel.com/docs](https://vercel.com/docs)
- **PlanetScale Docs:** [docs.planetscale.com](https://docs.planetscale.com)
- **Prisma Documentation:** [prisma.io/docs](https://prisma.io/docs)
- **NextAuth.js Docs:** [next-auth.js.org](https://next-auth.js.org)

### Emergency Fixes
If nothing works, try these emergency steps:

1. **Reset Database:**
   ```bash
   npx prisma migrate reset --force
   npx prisma db push
   ```

2. **Clean Vercel Cache:**
   - Delete the project and recreate it
   - Or contact Vercel support for cache clearing

3. **Check Network Connectivity:**
   - Ensure PlanetScale allows connections from Vercel IPs
   - Check if database region matches Vercel region

---

## 🎯 Success Checklist

- [ ] Environment variables are configured in Vercel
- [ ] PlanetScale database is accessible
- [ ] Database schema is applied
- [ ] Vercel build completes successfully
- [ ] API endpoints return proper responses
- [ ] User registration works without errors

**Once all items are checked, your 500 error should be resolved! 🎉**
