import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

interface HealthResponse {
  status: "healthy" | "unhealthy"
  timestamp: string
  uptime: number
  environment: string
  version: string
  database?: {
    status: "connected" | "disconnected"
    type?: string
    error?: string
  }
  environment_checks?: Record<string, boolean>
  optional_services?: Record<string, boolean>
  system?: {
    node_version: string
    platform: string
    arch: string
    memory: {
      used: number
      total: number
      rss: number
    }
    cpu: NodeJS.CpuUsage
  }
}

export async function GET(_request: NextRequest) {
  try {
    // Basic health check
    const health: HealthResponse = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      version: process.env.npm_package_version || "1.0.0"
    }

    // Database connectivity check
    try {
      await db.$queryRaw`SELECT 1`
      health.database = {
        status: "connected",
        type: "postgresql"
      }
    } catch (_error) {
      health.database = {
        status: "disconnected",
        type: "postgresql",
        error: "Database connection failed"
      }
      health.status = "unhealthy"
    }

    // Check critical environment variables
    const envChecks = {
      database_url: !!process.env.DATABASE_URL,
      nextauth_secret: !!process.env.NEXTAUTH_SECRET,
      nextauth_url: !!process.env.NEXTAUTH_URL,
    }

    health.environment_checks = envChecks

    // Optional service checks
    const optionalServices = {
      stripe: !!process.env.STRIPE_SECRET_KEY,
      twilio: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN),
      redis: !!process.env.REDIS_URL,
      smtp: !!(process.env.SMTP_HOST && process.env.SMTP_USER)
    }

    health.optional_services = optionalServices

    // System information
    health.system = {
      node_version: process.version,
      platform: process.platform,
      arch: process.arch,
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024)
      },
      cpu: process.cpuUsage()
    }

    const statusCode = health.status === "healthy" ? 200 : 503

    return NextResponse.json(health, { status: statusCode })
  } catch (error) {
    console.error("Health check error:", error)
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        error: "Health check failed"
      },
      { status: 500 }
    )
  }
}

export async function HEAD(_request: NextRequest) {
  // Simple HEAD request for load balancers
  return new Response(null, { status: 200 })
}