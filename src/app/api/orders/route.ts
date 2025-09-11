import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"
import { OrderStatus } from "@prisma/client"

const createOrderSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  items: z.array(z.object({
    productId: z.string().min(1, "Product ID is required"),
    quantity: z.number().min(1, "Quantity must be at least 1"),
    price: z.number().min(0, "Price must be positive")
  })).min(1, "At least one item is required"),
  notes: z.string().optional(),
  discount: z.number().min(0, "Discount must be positive").optional()
})

const _updateOrderSchema = z.object({
  status: z.enum(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]).optional(),
  notes: z.string().optional(),
  discount: z.number().min(0, "Discount must be positive").optional()
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
    const status = searchParams.get("status") as OrderStatus | null
    const customerId = searchParams.get("customerId")

    const skip = (page - 1) * limit

    const where: {
      status?: OrderStatus
      customerId?: string
    } = {}
    if (status) where.status = status
    if (customerId) where.customerId = customerId

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        include: {
          customer: true,
          user: true,
          items: {
            include: {
              product: true
            }
          },
          invoices: true
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" }
      }),
      db.order.count({ where })
    ])

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("GET /api/orders error:", error)
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
    const validatedData = createOrderSchema.parse(body)

    // Calculate total
    const subtotal = validatedData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const tax = subtotal * 0.08 // 8% tax
    const discount = validatedData.discount || 0
    const total = subtotal + tax - discount

    // Create order
    const order = await db.order.create({
      data: {
        orderNumber: `ORD-${Date.now()}`,
        customerId: validatedData.customerId,
        status: "PENDING",
        total,
        tax,
        discount,
        notes: validatedData.notes,
        userId: session.user.id,
        items: {
          create: validatedData.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
          }))
        }
      },
      include: {
        customer: true,
        user: true,
        items: {
          include: {
            product: true
          }
        }
      }
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      )
    }

    console.error("POST /api/orders error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
