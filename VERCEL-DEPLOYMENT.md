# 🚀 Vercel Deployment Guide

Complete step-by-step guide to deploy your CRM/ERP platform to Vercel.

## 📋 Prerequisites

- [Vercel Account](https://vercel.com) (free)
- [PlanetScale Account](https://planetscale.com) (free tier available)
- GitHub repository with your CRM/ERP platform code

## 🗄️ Database Setup (PlanetScale)

### 1. Create PlanetScale Database

1. **Sign up for PlanetScale** at [planetscale.com](https://planetscale.com)
2. **Create a new database:**
   - Click "Create Database"
   - Choose "MySQL" as the database type
   - Select your region (choose closest to your users)
   - Name your database (e.g., `crm-erp-prod`)

3. **Get your connection string:**
   - Go to your database dashboard
   - Click "Connect"
   - Choose "Prisma" as the connection method
   - Copy the connection string (it will look like):
   ```env
   mysql://username:password@host:port/database?sslaccept=strict
   ```

### 2. Database Migration

1. **Update your environment variables:**
   ```env
   DATABASE_URL="mysql://username:password@host:port/database?sslaccept=strict"
   ```

2. **Push your schema to PlanetScale:**
   ```bash
   npx prisma db push
   ```

3. **Seed the database (optional):**
   ```bash
   npx prisma db seed
   ```

## 🔧 Vercel Setup

### 1. Connect Your Repository

1. **Go to Vercel Dashboard** and click "Add New..." → "Project"
2. **Import your Git repository:**
   - Connect your GitHub account
   - Select your CRM/ERP platform repository
   - Click "Import"

### 2. Configure Build Settings

1. **Framework Preset:** Next.js (should auto-detect)
2. **Root Directory:** `./` (leave default)
3. **Build Command:** `prisma generate && next build`
4. **Output Directory:** `.next` (leave default)
5. **Install Command:** `npm install`

### 3. Environment Variables

Add the following environment variables in Vercel:

#### Required Variables
```env
DATABASE_URL=mysql://username:password@host:port/database?sslaccept=strict
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=your-super-secret-key-here
```

#### Optional Variables (for integrations)
```env
STRIPE_SECRET_KEY=sk_test_...
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1234567890
```

### 4. Deploy

1. **Click "Deploy"**
2. **Wait for the build to complete** (usually 2-5 minutes)
3. **Your app will be live** at `https://your-app-name.vercel.app`

## 🔄 Post-Deployment Setup

### 1. Update Database URL in Prisma

If your PlanetScale connection string changes after deployment, update it in Vercel:

1. Go to your project dashboard
2. Click "Settings" → "Environment Variables"
3. Update the `DATABASE_URL`
4. Redeploy your application

### 2. Database Schema Updates

When you make schema changes:

1. **Update your Prisma schema locally**
2. **Push changes to PlanetScale:**
   ```bash
   npx prisma db push
   ```
3. **Commit and push to GitHub** (triggers automatic redeploy)

## ⚙️ Vercel-Specific Configuration

### Custom Domain (Optional)

1. **Go to your project dashboard**
2. **Click "Settings" → "Domains"**
3. **Add your custom domain**
4. **Configure DNS records** as instructed

### Environment Variables Management

For different environments:

1. **Production:** Set variables in "Production" environment
2. **Preview:** Set different variables for pull requests
3. **Development:** Variables are shared across environments

### Build Hooks (Optional)

For automated deployments:

1. **Go to "Settings" → "Git"**
2. **Create a deploy hook URL**
3. **Use it in your CI/CD pipeline**

## 🚀 Deployment Commands

### Local Testing (before Vercel deployment)
```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Test build locally
npm run build

# Test the build
npm start
```

### Vercel CLI (Alternative deployment method)
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (first time)
vercel

# Deploy to production
vercel --prod
```

## 🔧 Troubleshooting

### Common Issues

1. **Build Fails - Prisma Generate**
   ```
   Error: Command "prisma generate" not found
   ```
   **Solution:** Add `prisma generate` to your build command in Vercel

2. **Database Connection Error**
   ```
   Can't reach database server
   ```
   **Solution:** Check your PlanetScale connection string and firewall settings

3. **Environment Variables Not Found**
   ```
   NEXTAUTH_SECRET is not set
   ```
   **Solution:** Add all required environment variables in Vercel dashboard

4. **Build Timeout**
   ```
   Build exceeded maximum allowed runtime
   ```
   **Solution:** Optimize your build process or contact Vercel support

### Logs and Debugging

1. **View Vercel Logs:**
   - Go to your project dashboard
   - Click "Functions" tab
   - Select a function to view its logs

2. **Debug Locally:**
   ```bash
   # Test with production environment variables
   DATABASE_URL="your-production-db-url" npm run dev
   ```

## 📊 Performance Optimization

### Vercel-Specific Optimizations

1. **Enable ISR (Incremental Static Regeneration):**
   ```javascript
   export const revalidate = 60 // Revalidate every 60 seconds
   ```

2. **Use Vercel Analytics:**
   - Go to "Settings" → "Analytics"
   - Enable Vercel Analytics for performance monitoring

3. **Optimize Images:**
   - Use Next.js Image component
   - Enable Vercel Image Optimization

## 🔒 Security Considerations

### Vercel Security Features

1. **HTTPS by Default:** All Vercel deployments include SSL certificates
2. **DDoS Protection:** Built-in DDoS protection
3. **CSP Headers:** Configure Content Security Policy
4. **Rate Limiting:** Built-in rate limiting for API routes

### Additional Security Measures

1. **Environment Variables:** Never expose sensitive data in client-side code
2. **API Routes:** Implement proper authentication for sensitive endpoints
3. **Database Security:** Use strong passwords and enable SSL connections
4. **Regular Updates:** Keep dependencies updated

## 📈 Scaling and Monitoring

### Monitoring Your App

1. **Vercel Analytics:** Built-in performance monitoring
2. **Error Tracking:** Use Sentry or similar services
3. **Database Monitoring:** Monitor PlanetScale performance
4. **API Monitoring:** Track API usage and response times

### Scaling Considerations

1. **Database Scaling:** PlanetScale handles scaling automatically
2. **Function Scaling:** Vercel scales functions automatically
3. **Caching:** Implement proper caching strategies
4. **CDN:** Vercel provides global CDN by default

## 🎯 Best Practices

### Deployment Best Practices

1. **Use Preview Deployments:** Test changes before production
2. **Environment Variables:** Use different variables for different environments
3. **Database Migrations:** Always test migrations before deploying
4. **Backup Strategy:** Regular database backups with PlanetScale

### Development Best Practices

1. **Git Workflow:** Use feature branches and pull requests
2. **Testing:** Write tests for critical functionality
3. **Documentation:** Keep deployment documentation updated
4. **Monitoring:** Set up alerts for critical issues

## 🆘 Support and Resources

### Vercel Resources
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Vercel Community](https://vercel.com/community)

### PlanetScale Resources
- [PlanetScale Documentation](https://docs.planetscale.com)
- [Prisma + PlanetScale Guide](https://www.prisma.io/docs/guides/database/planetscale)

### Getting Help
- **Vercel Support:** Contact through dashboard
- **PlanetScale Support:** Use their documentation
- **GitHub Issues:** Report issues in your repository

---

## 🚀 Your App is Live!

Once deployed successfully, your CRM/ERP platform will be available at:
`https://your-app-name.vercel.app`

### Next Steps:
1. **Set up your domain** (optional)
2. **Configure integrations** (Stripe, Twilio, etc.)
3. **Add users and customize** your platform
4. **Monitor performance** and optimize as needed

**Happy deploying! 🎉**
