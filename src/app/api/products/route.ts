import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const createProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  sku: z.string().min(1, "SKU is required"),
  price: z.number().min(0, "Price must be positive"),
  cost: z.number().min(0, "Cost must be positive").optional(),
  category: z.string().optional(),
  stock: z.number().min(0, "Stock must be positive").optional(),
  minStock: z.number().min(0, "Min stock must be positive").optional()
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const category = searchParams.get("category")
    const lowStock = searchParams.get("lowStock") === "true"

    const skip = (page - 1) * limit

    const where: {
      isActive?: boolean
      OR?: Array<{
        name?: { contains: string; mode: "insensitive" }
        sku?: { contains: string; mode: "insensitive" }
        category?: { contains: string; mode: "insensitive" }
      }>
      category?: string
      stock?: { lte: number }
    } = { isActive: true }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" as const } },
        { sku: { contains: search, mode: "insensitive" as const } },
        { category: { contains: search, mode: "insensitive" as const } }
      ]
    }
    if (category) where.category = category
    if (lowStock) {
      // We need to get the minStock value for each product individually
      // For now, we'll use a simple approach
      where.stock = { lte: 10 } // Default low stock threshold
    }

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        include: {
          orderItems: {
            include: {
              order: true
            },
            take: 5
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" }
      }),
      db.product.count({ where })
    ])

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("GET /api/products error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createProductSchema.parse(body)

    // Check if SKU already exists
    const existingProduct = await db.product.findUnique({
      where: { sku: validatedData.sku }
    })

    if (existingProduct) {
      return NextResponse.json(
        { error: "Product with this SKU already exists" },
        { status: 400 }
      )
    }

    const product = await db.product.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        sku: validatedData.sku,
        price: validatedData.price,
        cost: validatedData.cost,
        category: validatedData.category,
        stock: validatedData.stock || 0,
        minStock: validatedData.minStock || 0
      }
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      )
    }

    console.error("POST /api/products error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
