import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"
import { LeadStatus } from "@prisma/client"

const createLeadSchema = z.object({
  title: z.string().min(1, "Title is required"),
  value: z.number().min(0, "Value must be positive"),
  status: z.enum(["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "LOST"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  source: z.string().optional(),
  contactId: z.string().optional(),
  companyId: z.string().optional(),
  assignedToId: z.string().optional(),
  description: z.string().optional()
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
    const status = searchParams.get("status") as LeadStatus | null
    const assignedTo = searchParams.get("assignedTo")

    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}
    if (status) where.status = status
    if (assignedTo) where.assignedTo = assignedTo

    const [leads, total] = await Promise.all([
      db.lead.findMany({
        where,
        include: {
          contact: true,
          company: true,
          assignee: true,
          activities: {
            orderBy: { createdAt: "desc" },
            take: 5
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" }
      }),
      db.lead.count({ where })
    ])

    return NextResponse.json({
      leads,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("GET /api/leads error:", error)
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
    const validatedData = createLeadSchema.parse(body)

    const lead = await db.lead.create({
      data: {
        title: validatedData.title,
        value: validatedData.value,
        status: validatedData.status || "NEW",
        priority: validatedData.priority || "MEDIUM",
        source: validatedData.source,
        contactId: validatedData.contactId,
        companyId: validatedData.companyId,
  assignedTo: validatedData.assignedToId
      },
      include: {
        contact: true,
        company: true,
        assignee: true
      }
    })

    return NextResponse.json(lead, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      )
    }

    console.error("POST /api/leads error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
