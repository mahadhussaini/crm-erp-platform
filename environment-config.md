# Environment Configuration Guide

This document outlines all the environment variables required for the CRM/ERP platform.

## Required Environment Variables

### Database Configuration

#### For Local Development (SQLite)
```env
DATABASE_URL="file:./dev.db"
```
- SQLite database file path
- For development: `file:./dev.db`
- SQLite automatically creates the database file if it doesn't exist

#### For Vercel/Production (PostgreSQL)
```env
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"
```
- Use Neon, Supabase, Railway, or AWS RDS PostgreSQL
- Neon recommended for Vercel deployments (free tier available)
- Format: `postgresql://user:pass@host:port/db?sslmode=require`

### NextAuth.js Configuration
```env
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-change-in-production"
```
- `NEXTAUTH_URL`: Your application URL
- `NEXTAUTH_SECRET`: Random secret key (generate with `openssl rand -base64 32`)

## Optional Environment Variables

### OAuth Providers
```env
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
MICROSOFT_CLIENT_ID="your-microsoft-client-id"
MICROSOFT_CLIENT_SECRET="your-microsoft-client-secret"
```
- Configure in Google Cloud Console and Microsoft Azure AD
- Enables Google/Microsoft login options

### Stripe Payment Processing
```env
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```
- Get from Stripe Dashboard
- Enables payment processing features

### Twilio SMS/Communication
```env
TWILIO_ACCOUNT_SID="AC..."
TWILIO_AUTH_TOKEN="..."
TWILIO_PHONE_NUMBER="+1234567890"
TWILIO_WHATSAPP_NUMBER="+1234567890"
TWILIO_WEBHOOK_SECRET="..."
```
- Get from Twilio Console
- Enables SMS and WhatsApp messaging

### Email Configuration
```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
FROM_EMAIL="noreply@yourcompany.com"
```
- Configure SMTP settings for email notifications
- Use app passwords for Gmail

### Application Configuration
```env
NODE_ENV="development"
APP_NAME="CRM/ERP Platform"
APP_URL="http://localhost:3000"
```

### Security Configuration
```env
ENCRYPTION_KEY="your-32-character-encryption-key"
JWT_SECRET="additional-jwt-secret-for-api-tokens"
```

### Redis Configuration (Optional)
```env
REDIS_URL="redis://localhost:6379"
```
- Enables Redis caching for better performance

### File Upload Configuration
```env
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE="10485760"
```
- `MAX_FILE_SIZE`: Maximum file size in bytes (default: 10MB)

### API Rate Limiting
```env
RATE_LIMIT_WINDOW="900000"
RATE_LIMIT_MAX="100"
```
- `RATE_LIMIT_WINDOW`: Time window in milliseconds (default: 15 minutes)
- `RATE_LIMIT_MAX`: Maximum requests per window (default: 100)

## Setting Up Environment Variables

1. Copy the template:
```bash
cp .env.example .env.local
```

2. Edit the file with your actual values:
```bash
nano .env.local
```

3. For production, set these environment variables in your deployment platform (Vercel, Railway, etc.)

## Third-Party Service Setup

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)

### Microsoft OAuth
1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to Azure Active Directory
3. Register a new application
4. Configure redirect URIs
5. Note down the Application (client) ID and Directory (tenant) ID

### Stripe Setup
1. Create account at [Stripe](https://stripe.com/)
2. Get your API keys from the dashboard
3. Configure webhook endpoints for payment events:
   - `https://yourdomain.com/api/webhooks/stripe`

### Twilio Setup
1. Create account at [Twilio](https://twilio.com/)
2. Get your Account SID and Auth Token
3. Purchase a phone number for SMS
4. Configure webhook URLs:
   - SMS: `https://yourdomain.com/api/webhooks/twilio`
   - Voice: `https://yourdomain.com/api/webhooks/twilio`

## Security Best Practices

1. **Never commit `.env.local` to version control**
2. **Use different secrets for development and production**
3. **Rotate secrets regularly**
4. **Use environment-specific databases**
5. **Enable 2FA for all admin accounts**
6. **Monitor API usage and set up alerts**

## Troubleshooting

### Common Issues

1. **Database connection errors**: Check DATABASE_URL format
2. **OAuth login failures**: Verify redirect URIs match exactly
3. **Stripe webhooks not working**: Ensure webhook endpoint is publicly accessible
4. **Twilio SMS not sending**: Check phone number format and region restrictions

### Testing Configuration

Test your setup with these commands:
```bash
# Test database connection
npm run db:studio

# Test application startup
npm run dev

# Test API endpoints
curl http://localhost:3000/api/health
```
