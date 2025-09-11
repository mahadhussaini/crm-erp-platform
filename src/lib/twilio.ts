import twilio from "twilio"
import { createHmac } from "crypto"

if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
  console.warn("Twilio credentials not configured. SMS features will not work.")
}

const client = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null as ReturnType<typeof twilio> | null

export default client

export async function sendSMS(to: string, message: string, from?: string) {
  if (!client) {
    throw new Error("Twilio is not configured. Please set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN environment variables.")
  }

  try {
    const sms = await client.messages.create({
      body: message,
      to,
      from: from || process.env.TWILIO_PHONE_NUMBER || "",
    })

    return {
      sid: sms.sid,
      status: sms.status,
      to: sms.to,
      from: sms.from,
    }
  } catch (error) {
    console.error("Twilio SMS send error:", error)
    throw new Error("Failed to send SMS")
  }
}

export async function sendBulkSMS(
  recipients: string[],
  message: string,
  from?: string
) {
  if (!client) {
    throw new Error("Twilio is not configured. Please set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN environment variables.")
  }

  try {
    const promises = recipients.map(recipient =>
      client.messages.create({
        body: message,
        to: recipient,
        from: from || process.env.TWILIO_PHONE_NUMBER || "",
      })
    )

    const results = await Promise.allSettled(promises)

    return results.map((result, index) => ({
      recipient: recipients[index],
      success: result.status === "fulfilled",
      ...(result.status === "fulfilled"
        ? { sid: result.value.sid, status: result.value.status }
        : { error: result.reason.message }
      )
    }))
  } catch (error) {
    console.error("Twilio bulk SMS send error:", error)
    throw new Error("Failed to send bulk SMS")
  }
}

export async function makeCall(to: string, twimlUrl: string, from?: string) {
  if (!client) {
    throw new Error("Twilio is not configured. Please set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN environment variables.")
  }

  try {
    const call = await client.calls.create({
      to,
      from: from || process.env.TWILIO_PHONE_NUMBER || "",
      url: twimlUrl,
    })

    return {
      sid: call.sid,
      status: call.status,
      to: call.to,
      from: call.from,
    }
  } catch (error) {
    console.error("Twilio call creation error:", error)
    throw new Error("Failed to make call")
  }
}

export async function sendWhatsApp(to: string, message: string) {
  if (!client) {
    throw new Error("Twilio is not configured. Please set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN environment variables.")
  }

  try {
    const whatsapp = await client.messages.create({
      body: message,
      to: `whatsapp:${to}`,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
    })

    return {
      sid: whatsapp.sid,
      status: whatsapp.status,
      to: whatsapp.to,
      from: whatsapp.from,
    }
  } catch (error) {
    console.error("Twilio WhatsApp send error:", error)
    throw new Error("Failed to send WhatsApp message")
  }
}

export async function getMessageStatus(messageSid: string) {
  if (!client) {
    throw new Error("Twilio is not configured. Please set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN environment variables.")
  }

  try {
    const message = await client.messages(messageSid).fetch()
    return {
      sid: message.sid,
      status: message.status,
      to: message.to,
      from: message.from,
      dateSent: message.dateSent,
      errorMessage: message.errorMessage,
    }
  } catch (error) {
    console.error("Twilio message status retrieval error:", error)
    throw new Error("Failed to retrieve message status")
  }
}

export async function validatePhoneNumber(phoneNumber: string) {
  if (!client) {
    throw new Error("Twilio is not configured. Please set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN environment variables.")
  }

  try {
    const validation = await client.lookups.v2.phoneNumbers(phoneNumber).fetch()
    return {
      valid: validation.valid,
      phoneNumber: validation.phoneNumber,
      countryCode: validation.countryCode,
      carrier: (validation as { carrier?: string }).carrier || "Unknown",
    }
  } catch (error) {
    console.error("Twilio phone number validation error:", error)
    throw new Error("Failed to validate phone number")
  }
}

// Webhook handling
export function validateWebhookRequest(
  rawBody: string,
  signature: string,
  url: string
) {
  const authToken = process.env.TWILIO_AUTH_TOKEN!

  try {
    const expectedSignature = createHmac("sha1", authToken)
      .update(url + rawBody)
      .digest("base64")

    return signature === expectedSignature
  } catch (error) {
    console.error("Twilio webhook validation error:", error)
    return false
  }
}
