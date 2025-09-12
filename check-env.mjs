#!/usr/bin/env node

/**
 * Environment Variables Diagnostic Script
 * Helps diagnose environment variable issues for Vercel deployment
 */

console.log('🔍 Environment Variables Diagnostic\n');

// Check required environment variables
const requiredVars = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL'
];

const optionalVars = [
  'NODE_ENV',
  'VERCEL_ENV',
  'VERCEL_URL'
];

console.log('📋 Required Environment Variables:');
requiredVars.forEach(varName => {
  const value = process.env[varName];
  const status = value ? '✅ Set' : '❌ Missing';
  const displayValue = value ?
    (varName === 'DATABASE_URL' ? value.replace(/\/\/.*@/, '//***:***@') : '[HIDDEN]') :
    'undefined';

  console.log(`  ${varName}: ${status} (${displayValue})`);
});

console.log('\n📋 Optional Environment Variables:');
optionalVars.forEach(varName => {
  const value = process.env[varName];
  const status = value ? '✅ Set' : '⚠️  Not set';
  console.log(`  ${varName}: ${status} (${value || 'undefined'})`);
});

// Database URL validation
console.log('\n🗄️  Database URL Analysis:');
const dbUrl = process.env.DATABASE_URL;
if (dbUrl) {
  const isPostgres = dbUrl.includes('postgresql://') || dbUrl.includes('postgres://');
  const isMySQL = dbUrl.includes('mysql://');
  const isSQLite = dbUrl.includes('file:');

  if (isPostgres) {
    console.log('  ✅ PostgreSQL URL detected');
  } else if (isMySQL) {
    console.log('  ⚠️  MySQL URL detected (should be PostgreSQL for Vercel)');
  } else if (isSQLite) {
    console.log('  ⚠️  SQLite URL detected (not suitable for production)');
  } else {
    console.log('  ❓ Unknown database type');
  }

  // Check for SSL
  const hasSSL = dbUrl.includes('sslmode=require') || dbUrl.includes('sslaccept=strict');
  console.log(`  SSL: ${hasSSL ? '✅ Enabled' : '⚠️  Not configured'}`);
} else {
  console.log('  ❌ DATABASE_URL not set');
}

console.log('\n🔧 Recommendations:');
if (!process.env.DATABASE_URL) {
  console.log('  1. Set DATABASE_URL in Vercel environment variables');
  console.log('  2. Use PostgreSQL database (Neon, Supabase, Railway, etc.)');
  console.log('  3. Format: postgresql://user:pass@host:port/db?sslmode=require');
}

if (!process.env.NEXTAUTH_SECRET) {
  console.log('  1. Set NEXTAUTH_SECRET in Vercel environment variables');
  console.log('  2. Generate with: openssl rand -base64 32');
}

if (!process.env.NEXTAUTH_URL) {
  console.log('  1. Set NEXTAUTH_URL in Vercel environment variables');
  console.log('  2. Format: https://your-app-name.vercel.app');
}

console.log('\n📚 Next Steps:');
console.log('  1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables');
console.log('  2. Verify all required variables are set correctly');
console.log('  3. Redeploy your application');
console.log('  4. Check Vercel function logs for any remaining errors');

console.log('\n🚀 Testing Commands:');
console.log('  # Test health endpoint:');
console.log('  curl https://your-app.vercel.app/api/health');
console.log('');
console.log('  # Test registration:');
console.log('  curl -X POST https://your-app.vercel.app/api/auth/register \\');
console.log('    -H "Content-Type: application/json" \\');
console.log('    -d \'{"name":"Test","email":"test@example.com","password":"password123"}\'');
