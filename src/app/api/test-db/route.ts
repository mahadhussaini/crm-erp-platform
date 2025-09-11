import { NextRequest, NextResponse } from "next/server"
import { checkDatabaseHealth } from "@/lib/db"

export async function GET(_request: NextRequest) {
  try {
    console.log("🧪 Database test API called")

    // Log environment information
    const envInfo = {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL_EXISTS: !!process.env.DATABASE_URL,
      DATABASE_URL_TYPE: process.env.DATABASE_URL?.split(':')[0],
      NEXTAUTH_SECRET_EXISTS: !!process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    }

    console.log("📊 Environment info:", envInfo)

    // Test database connection
    const dbHealth = await checkDatabaseHealth()
    console.log("💾 Database health result:", dbHealth)

    return NextResponse.json({
      success: true,
      message: "Database test completed",
      environment: envInfo,
      database: dbHealth,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error("❌ Database test failed:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Database test failed",
        details: error instanceof Error ? error.message : String(error),
        environment: {
          NODE_ENV: process.env.NODE_ENV,
          DATABASE_URL_EXISTS: !!process.env.DATABASE_URL,
          DATABASE_URL_TYPE: process.env.DATABASE_URL?.split(':')[0],
        },
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
