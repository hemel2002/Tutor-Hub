import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  try {
    const { subject, tutorName, childName, amount } = await req.json();

    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    
    // Fallback to mock mode if Stripe secret is not configured
    if (!stripeSecret) {
      return NextResponse.json({
        mock: true,
        message: "Stripe Secret Key is not configured. Falling back to mock client-side checkout simulation."
      });
    }

    const stripe = new Stripe(stripeSecret, {
      apiVersion: "2023-10-16" as any
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${subject} Session with ${tutorName}`,
              description: `Specialized learning/tutoring session for ${childName}`,
            },
            unit_amount: amount ? Math.round(amount * 100) : 4500, // default $45.00 in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.nextUrl.origin}/parent?success=true&tutor=${encodeURIComponent(tutorName)}&subject=${encodeURIComponent(subject)}`,
      cancel_url: `${req.nextUrl.origin}/parent?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe Session Creation Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session." },
      { status: 500 }
    );
  }
}
