import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/server/db";
import { getPayments } from "@/server/services/settings.service";
import { logAudit } from "@/server/services/audit.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Verifica la firma de Stripe (Stripe-Signature: t=…,v1=…) en tiempo constante. */
function verifySignature(payload: string, header: string, secret: string): boolean {
  const parts = Object.fromEntries(header.split(",").map((p) => p.split("=")));
  const t = parts["t"];
  const v1 = parts["v1"];
  if (!t || !v1) return false;
  // Tolerancia de 5 min contra replays.
  const age = Math.abs(Date.now() / 1000 - Number(t));
  if (!Number.isFinite(age) || age > 300) return false;
  const expected = crypto.createHmac("sha256", secret).update(`${t}.${payload}`).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(v1));
  } catch {
    return false;
  }
}

// POST /api/print/stripe/webhook → confirma el pago de forma fiable (no depende
// de que el usuario vuelva a la página). Marca el PrintOrder como PAID.
export async function POST(req: NextRequest) {
  const pay = await getPayments();
  if (!pay.stripeWebhookSecret) {
    return NextResponse.json({ error: "webhook_not_configured" }, { status: 400 });
  }
  const sig = req.headers.get("stripe-signature");
  const body = await req.text(); // cuerpo CRUDO para verificar la firma
  if (!sig || !verifySignature(body, sig, pay.stripeWebhookSecret)) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  const event = JSON.parse(body);
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.metadata?.orderId;
    if (orderId && session.payment_status === "paid") {
      const order = await prisma.printOrder.findUnique({ where: { id: orderId } });
      if (
        order &&
        order.status !== "PAID" &&
        session.amount_total === order.amountCents &&
        String(session.currency).toLowerCase() === order.currency.toLowerCase()
      ) {
        await prisma.printOrder.update({ where: { id: orderId }, data: { status: "PAID", paidAt: new Date() } });
        await logAudit({ action: "PRINT_PAID", entityType: "PrintOrder", entityId: orderId, metadata: { via: "webhook" } });
      }
    }
  }

  return NextResponse.json({ received: true });
}
