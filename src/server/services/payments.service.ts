import { getPayments } from "@/server/services/settings.service";

/**
 * Pasarela de pago vía REST (sin SDK): Stripe Checkout y PayPal Orders.
 * Se activa cuando hay claves configuradas en /superadmin/pagos. "Preparado":
 * crea sesiones/órdenes y verifica el pago en el retorno.
 */

export interface CheckoutInput {
  provider: "stripe" | "paypal";
  orderId: string;
  amountCents: number;
  currency: string;
  productName: string;
  successUrl: string;
  cancelUrl: string;
}

export async function createCheckout(input: CheckoutInput): Promise<{ url: string; externalId: string }> {
  const pay = await getPayments();
  if (input.provider === "stripe") {
    if (!pay.stripeEnabled || !pay.stripeSecretKey) throw new Error("stripe_not_configured");
    const body = new URLSearchParams();
    body.set("mode", "payment");
    body.set("success_url", input.successUrl);
    body.set("cancel_url", input.cancelUrl);
    body.set("line_items[0][quantity]", "1");
    body.set("line_items[0][price_data][currency]", input.currency.toLowerCase());
    body.set("line_items[0][price_data][unit_amount]", String(input.amountCents));
    body.set("line_items[0][price_data][product_data][name]", input.productName);
    body.set("metadata[orderId]", input.orderId);
    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: { Authorization: `Bearer ${pay.stripeSecretKey}`, "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message ?? "stripe_error");
    return { url: data.url, externalId: data.id };
  }

  // PayPal
  if (!pay.paypalEnabled || !pay.paypalClientId || !pay.paypalSecret) throw new Error("paypal_not_configured");
  const base = pay.paypalMode === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
  const auth = Buffer.from(`${pay.paypalClientId}:${pay.paypalSecret}`).toString("base64");
  const tokRes = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
  });
  const tok = await tokRes.json();
  if (!tokRes.ok) throw new Error("paypal_auth_error");
  const orderRes = await fetch(`${base}/v2/checkout/orders`, {
    method: "POST",
    headers: { Authorization: `Bearer ${tok.access_token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [{ amount: { currency_code: input.currency, value: (input.amountCents / 100).toFixed(2) }, custom_id: input.orderId }],
      application_context: { return_url: input.successUrl, cancel_url: input.cancelUrl, shipping_preference: "NO_SHIPPING", user_action: "PAY_NOW" },
    }),
  });
  const order = await orderRes.json();
  if (!orderRes.ok) throw new Error("paypal_order_error");
  const approve = (order.links ?? []).find((l: { rel: string; href: string }) => l.rel === "approve");
  if (!approve) throw new Error("paypal_no_approve_link");
  return { url: approve.href, externalId: order.id };
}

/** Verifica/captura el pago en el retorno. Devuelve true si está pagado. */
export async function verifyPayment(provider: "stripe" | "paypal", externalId: string): Promise<boolean> {
  const pay = await getPayments();
  if (provider === "stripe") {
    if (!pay.stripeSecretKey) return false;
    const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${externalId}`, {
      headers: { Authorization: `Bearer ${pay.stripeSecretKey}` },
    });
    const data = await res.json();
    return res.ok && data.payment_status === "paid";
  }
  if (!pay.paypalClientId || !pay.paypalSecret) return false;
  const base = pay.paypalMode === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
  const auth = Buffer.from(`${pay.paypalClientId}:${pay.paypalSecret}`).toString("base64");
  const tokRes = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
  });
  const tok = await tokRes.json();
  const capRes = await fetch(`${base}/v2/checkout/orders/${externalId}/capture`, {
    method: "POST",
    headers: { Authorization: `Bearer ${tok.access_token}`, "Content-Type": "application/json" },
  });
  const cap = await capRes.json();
  return capRes.ok && cap.status === "COMPLETED";
}

/** ¿Hay alguna pasarela lista? */
export async function availableProviders(): Promise<("stripe" | "paypal")[]> {
  const pay = await getPayments();
  const list: ("stripe" | "paypal")[] = [];
  if (pay.stripeEnabled && pay.stripeSecretKey) list.push("stripe");
  if (pay.paypalEnabled && pay.paypalClientId && pay.paypalSecret) list.push("paypal");
  return list;
}
