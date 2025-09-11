import { Stripe } from "stripe"

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("STRIPE_SECRET_KEY is not configured. Stripe features will not work.")
}

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-08-27.basil",
    })
  : null as Stripe | null

export default stripe

export async function createPaymentIntent(amount: number, currency: string = "usd") {
  if (!stripe) {
    throw new Error("Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.")
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return {
      clientSecret: paymentIntent.client_secret,
      id: paymentIntent.id,
    }
  } catch (error) {
    console.error("Stripe payment intent creation error:", error)
    throw new Error("Failed to create payment intent")
  }
}

export async function createCustomer(email: string, name: string) {
  if (!stripe) {
    throw new Error("Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.")
  }

  try {
    const customer = await stripe.customers.create({
      email,
      name,
    })

    return customer
  } catch (error) {
    console.error("Stripe customer creation error:", error)
    throw new Error("Failed to create customer")
  }
}

export async function createSubscription(
  customerId: string,
  priceId: string,
  paymentMethodId?: string
) {
  if (!stripe) {
    throw new Error("Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.")
  }

  try {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      default_payment_method: paymentMethodId,
      expand: ["latest_invoice.payment_intent"],
    })

    return subscription
  } catch (error) {
    console.error("Stripe subscription creation error:", error)
    throw new Error("Failed to create subscription")
  }
}

export async function handleWebhook(rawBody: string, signature: string) {
  if (!stripe) {
    throw new Error("Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.")
  }

  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

  try {
    const event = stripe.webhooks.constructEvent(rawBody, signature, endpointSecret)
    return event
  } catch (error) {
    console.error("Stripe webhook verification error:", error)
    throw new Error("Webhook verification failed")
  }
}

export async function getPaymentMethods(customerId: string) {
  if (!stripe) {
    throw new Error("Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.")
  }

  try {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: "card",
    })

    return paymentMethods.data
  } catch (error) {
    console.error("Stripe payment methods retrieval error:", error)
    throw new Error("Failed to retrieve payment methods")
  }
}
