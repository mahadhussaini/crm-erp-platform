import { NextRequest, NextResponse } from "next/server"
import { handleWebhook } from "@/lib/stripe"

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get("stripe-signature")!

    if (!signature) {
      return NextResponse.json({ error: "No signature" }, { status: 400 })
    }

    const event = await handleWebhook(rawBody, signature)

    // Handle different event types
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object
        console.log("Payment succeeded:", paymentIntent.id)

        // Update order status in database
        // This would typically update an order record to mark it as paid
        break

      case "payment_intent.payment_failed":
        const failedPayment = event.data.object
        console.log("Payment failed:", failedPayment.id)

        // Handle failed payment
        // Could send notification to user, update order status, etc.
        break

      case "invoice.payment_succeeded":
        const invoice = event.data.object
        console.log("Invoice payment succeeded:", invoice.id)

        // Handle successful invoice payment
        break

      case "customer.subscription.created":
        const subscription = event.data.object
        console.log("Subscription created:", subscription.id)

        // Handle new subscription
        break

      case "customer.subscription.updated":
        const updatedSubscription = event.data.object
        console.log("Subscription updated:", updatedSubscription.id)

        // Handle subscription changes
        break

      case "customer.subscription.deleted":
        const cancelledSubscription = event.data.object
        console.log("Subscription cancelled:", cancelledSubscription.id)

        // Handle subscription cancellation
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Stripe webhook error:", error)
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ message: "Stripe webhook endpoint" })
}
