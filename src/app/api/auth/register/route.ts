import { NextRequest, NextResponse } from "next/server"
import { db, checkDatabaseHealth } from "@/lib/db"
import { hashPassword } from "@/lib/auth"
import { z } from "zod"

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["ADMIN", "MANAGER", "EMPLOYEE", "CUSTOMER"]).optional()
})

export async function POST(request: NextRequest) {
  try {
    console.log("🔧 Registration API called")

    // Log environment info for debugging
    console.log("🌍 Environment:", process.env.NODE_ENV)
    console.log("🔗 DATABASE_URL exists:", !!process.env.DATABASE_URL)
    console.log("🔐 NEXTAUTH_SECRET exists:", !!process.env.NEXTAUTH_SECRET)

    // Check database connection first
    try {
      console.log("🔍 Testing database connection...")
      const dbHealth = await checkDatabaseHealth()
      console.log("💾 Database health:", dbHealth.status)

      if (dbHealth.status !== 'healthy') {
        console.error("❌ Database health check failed:", dbHealth)
        return NextResponse.json(
          {
            error: "Database connection error",
            details: process.env.NODE_ENV === 'development' ? dbHealth.error : "Please try again later",
            code: "DB_CONNECTION_ERROR"
          },
          { status: 500 }
        )
      }
    } catch (dbError) {
      console.error("❌ Database connection test failed:", dbError)
      return NextResponse.json(
        {
          error: "Database connection error",
          details: process.env.NODE_ENV === 'development' ? (dbError instanceof Error ? dbError.message : String(dbError)) : "Please try again later",
          code: "DB_TEST_ERROR"
        },
        { status: 500 }
      )
    }

    // Check if required environment variables are set
    if (!process.env.NEXTAUTH_SECRET) {
      console.error("❌ NEXTAUTH_SECRET is not configured")
      return NextResponse.json(
        {
          error: "Server configuration error",
          details: "Authentication not properly configured",
          code: "CONFIG_ERROR"
        },
        { status: 500 }
      )
    }

    // Parse and validate request body
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      )
    }

    const { name, email, password, role = "EMPLOYEE" } = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      message: "User created successfully",
      user
    })
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation error",
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      )
    }

    // Handle Prisma errors
    if (error?.code) {
      console.error("Database error:", error)

      // Handle specific database errors
      if (error.code === 'P1001') {
        return NextResponse.json(
          { error: "Database server unreachable" },
          { status: 500 }
        )
      }

      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: "User with this email already exists" },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { error: "Database operation failed" },
        { status: 500 }
      )
    }

    // Handle other errors
    console.error("Registration error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}
