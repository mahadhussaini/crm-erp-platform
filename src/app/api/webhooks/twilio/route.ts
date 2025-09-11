import { NextRequest, NextResponse } from "next/server"
import { validateWebhookRequest } from "@/lib/twilio"
import { db } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get("x-twilio-signature")!
    const url = process.env.NEXTAUTH_URL + "/api/webhooks/twilio"

    if (!signature) {
      return NextResponse.json({ error: "No signature" }, { status: 400 })
    }

    // Validate webhook authenticity
    const isValid = validateWebhookRequest(rawBody, signature, url)
    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    // Parse the form data (Twilio sends form-encoded data)
    const formData = new URLSearchParams(rawBody)
    const messageType = formData.get("MessageType")

    switch (messageType) {
      case "sms":
        await handleIncomingSMS(formData)
        break

      case "call":
        await handleIncomingCall(formData)
        break

      default:
        console.log(`Unhandled message type: ${messageType}`)
    }

    // Return TwiML response for SMS
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>Thank you for your message. We'll get back to you soon!</Message>
</Response>`

    return new Response(twiml, {
      headers: { "Content-Type": "application/xml" }
    })
  } catch (error) {
    console.error("Twilio webhook error:", error)
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    )
  }
}

async function handleIncomingSMS(formData: URLSearchParams) {
  const from = formData.get("From")
  const to = formData.get("To")
  const body = formData.get("Body")
  const messageSid = formData.get("MessageSid")

  console.log("Incoming SMS:", { from, to, body, messageSid })

  try {
    // Find or create contact based on phone number
    let contact = await db.contact.findFirst({
      where: { phone: from?.replace("whatsapp:", "") }
    })

    if (!contact && from) {
      contact = await db.contact.create({
        data: {
          firstName: "Unknown",
          lastName: "Contact",
          phone: from.replace("whatsapp:", "")
        }
      })
    }

    if (contact && body) {
      // Create activity record
      await db.activity.create({
        data: {
          type: "NOTE",
          title: "Incoming SMS",
          description: `SMS received: ${body}`,
          date: new Date(),
          contactId: contact.id,
          userId: "system" // You might want to handle this differently
        }
      })
    }

    // Here you could add logic to:
    // - Auto-respond based on keywords
    // - Create leads from specific messages
    // - Forward messages to sales team
    // - Integration with CRM workflows

  } catch (error) {
    console.error("Error handling incoming SMS:", error)
  }
}

async function handleIncomingCall(formData: URLSearchParams) {
  const from = formData.get("From")
  const to = formData.get("To")
  const callSid = formData.get("CallSid")
  const callStatus = formData.get("CallStatus")

  console.log("Incoming call:", { from, to, callSid, callStatus })

  try {
    // Find or create contact based on phone number
    let contact = await db.contact.findFirst({
      where: { phone: from }
    })

    if (!contact && from) {
      contact = await db.contact.create({
        data: {
          firstName: "Unknown",
          lastName: "Contact",
          phone: from
        }
      })
    }

    if (contact) {
      // Create activity record
      await db.activity.create({
        data: {
          type: "CALL",
          title: `Incoming Call - ${callStatus}`,
          description: `Call from ${from} - Status: ${callStatus}`,
          date: new Date(),
          contactId: contact.id,
          userId: "system"
        }
      })
    }

    // Handle different call statuses
    switch (callStatus) {
      case "ringing":
        // Call is ringing
        break
      case "in-progress":
        // Call is in progress
        break
      case "completed":
        // Call completed successfully
        break
      case "busy":
      case "no-answer":
        // Call failed
        break
    }

  } catch (error) {
    console.error("Error handling incoming call:", error)
  }
}

export async function GET() {
  return NextResponse.json({ message: "Twilio webhook endpoint" })
}
