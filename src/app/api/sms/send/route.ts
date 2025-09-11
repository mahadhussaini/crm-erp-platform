import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { sendSMS, sendBulkSMS } from "@/lib/twilio"
import { z } from "zod"

const sendSMSSchema = z.object({
  to: z.string().min(1, "Recipient phone number is required"),
  message: z.string().min(1, "Message is required").max(160, "Message too long"),
})

const sendBulkSMSSchema = z.object({
  recipients: z.array(z.string()).min(1, "At least one recipient required"),
  message: z.string().min(1, "Message is required").max(160, "Message too long"),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const searchParams = request.nextUrl.searchParams
    const bulk = searchParams.get("bulk")

    if (bulk === "true") {
      // Bulk SMS
      const validatedData = sendBulkSMSSchema.parse(body)
      const results = await sendBulkSMS(
        validatedData.recipients,
        validatedData.message
      )

      return NextResponse.json({
        message: "Bulk SMS sent",
        results
      })
    } else {
      // Single SMS
      const validatedData = sendSMSSchema.parse(body)
      const result = await sendSMS(validatedData.to, validatedData.message)

      return NextResponse.json({
        message: "SMS sent successfully",
        result
      })
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      )
    }

    console.error("SMS send error:", error)
    return NextResponse.json(
      { error: "Failed to send SMS" },
      { status: 500 }
    )
  }
}
