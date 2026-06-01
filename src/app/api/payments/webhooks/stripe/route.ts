import { NextRequest, NextResponse } from "next/server";
import { constructWebhookEvent } from "@/lib/stripe";
import { confirmTicketPurchase } from "@/services/tickets.service";
import { prisma } from "@/lib/db/client";

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event;
  try {
    event = constructWebhookEvent(payload, sig);
  } catch (err) {
    console.error("[WEBHOOK] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const intent = event.data.object;
        const userId = intent.metadata["userId"];
        if (userId) {
          await confirmTicketPurchase(intent.id, userId);
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const intent = event.data.object;
        console.warn("[WEBHOOK] Payment failed:", intent.id);
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object;
        const refundId = charge.refunds?.data?.[0]?.id;
        if (refundId) {
          await prisma.ticket.updateMany({
            where: { stripeRefundId: refundId, status: "VALID" },
            data: { status: "REFUNDED", refundedAt: new Date() },
          });
        }
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error("[WEBHOOK] Handler error:", err);
  }

  return NextResponse.json({ received: true });
}
