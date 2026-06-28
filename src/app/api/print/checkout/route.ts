import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { getPrintConfig, getPayments } from "@/server/services/settings.service";
import { createCheckout } from "@/server/services/payments.service";
import { rateLimit, clientIpFrom } from "@/server/services/ratelimit.service";
import { siteUrl } from "@/lib/seo";

export const runtime = "nodejs";

// POST /api/print/checkout { photoId, kind: "print"|"download", provider, locale }
// Crea el pedido y la sesión de pago; devuelve la URL de la pasarela.
export async function POST(req: NextRequest) {
  if (!(await rateLimit(`checkout:${clientIpFrom(req.headers)}`, 10, 600)).ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }
  const body = await req.json().catch(() => ({}));
  const photoId = String(body.photoId ?? "");
  const kind = body.kind === "print" ? "print" : "download";
  const provider = body.provider === "paypal" ? "paypal" : "stripe";
  const locale = String(body.locale ?? "es");

  const photo = await prisma.photo.findUnique({ where: { id: photoId }, select: { id: true } });
  if (!photo) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const cfg = await getPrintConfig();
  const pay = await getPayments();
  const enabled = kind === "download" ? cfg.downloadEnabled : cfg.printEnabled;
  if (!enabled) return NextResponse.json({ error: "sale_disabled" }, { status: 400 });
  const amountCents = kind === "download" ? cfg.downloadPriceCents : cfg.printPriceCents;

  const order = await prisma.printOrder.create({
    data: { photoId, kind, amountCents, currency: pay.currency, provider: provider === "stripe" ? "STRIPE" : "PAYPAL" },
  });

  const okUrl = `${siteUrl()}/${locale}/comprar/${photoId}/ok?order=${order.id}&provider=${provider}`;
  const cancelUrl = `${siteUrl()}/${locale}/comprar/${photoId}`;

  try {
    const { url, externalId } = await createCheckout({
      provider,
      orderId: order.id,
      amountCents,
      currency: pay.currency,
      productName: kind === "download" ? "Foto Calatafest (alta calidad)" : "Impresión foto Calatafest",
      successUrl: okUrl,
      cancelUrl,
    });
    await prisma.printOrder.update({ where: { id: order.id }, data: { externalId } });
    return NextResponse.json({ url });
  } catch (e) {
    await prisma.printOrder.update({ where: { id: order.id }, data: { status: "CANCELLED" } });
    const msg = e instanceof Error ? e.message : "error";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
