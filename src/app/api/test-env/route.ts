import { NextResponse } from "next/server"

export async function GET() {
  const envStatus = {
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV,
      VERCEL_URL: process.env.VERCEL_URL,
    },
    database: {
      DATABASE_URL: process.env.DATABASE_URL ? "Set (hidden for security)" : "Missing",
      database_type: process.env.DATABASE_URL?.includes('postgresql') ? 'PostgreSQL' :
                    process.env.DATABASE_URL?.includes('mysql') ? 'MySQL' :
                    process.env.DATABASE_URL?.includes('file:') ? 'SQLite' : 'Unknown',
      has_ssl: process.env.DATABASE_URL?.includes('sslmode=require') || process.env.DATABASE_URL?.includes('sslaccept=strict')
    },
    auth: {
      NEXTAUTH_URL: process.env.NEXTAUTH_URL ? "Set" : "Missing",
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "Set (hidden)" : "Missing"
    }
  }

  const isConfigured = !!(process.env.DATABASE_URL && process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_URL)

  return NextResponse.json({
    status: isConfigured ? "configured" : "missing_variables",
    message: isConfigured ?
      "All required environment variables are set" :
      "Some required environment variables are missing",
    ...envStatus
  })
}
