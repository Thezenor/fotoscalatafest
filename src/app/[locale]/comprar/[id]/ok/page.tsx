import { notFound } from "next/navigation";
import { CheckCircle2, XCircle, Download } from "lucide-react";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/server/db";
import { verifyPayment } from "@/server/services/payments.service";
import { ensurePrintCode } from "@/server/services/print.service";
import { logAudit } from "@/server/services/audit.service";
import { buttonClass } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

export default async function CheckoutOkPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ order?: string; provider?: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const { order: orderId, provider } = await searchParams;
  if (!orderId) notFound();

  const order = await prisma.printOrder.findUnique({ where: { id: orderId } });
  if (!order || order.photoId !== id) notFound();

  let paid = order.status === "PAID";
  if (!paid && order.externalId && (provider === "stripe" || provider === "paypal")) {
    paid = await verifyPayment(provider, {
      id: order.id,
      externalId: order.externalId,
      amountCents: order.amountCents,
      currency: order.currency,
    });
    if (paid) {
      await prisma.printOrder.update({ where: { id: order.id }, data: { status: "PAID", paidAt: new Date() } });
      await logAudit({ action: "PRINT_PAID", entityType: "PrintOrder", entityId: order.id, metadata: { kind: order.kind, provider } });
    }
  }

  const code = paid && order.kind === "print" ? await ensurePrintCode(id) : null;

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center gap-4 px-6 py-12 text-center">
      {paid ? (
        <>
          <CheckCircle2 className="h-16 w-16 text-success" />
          <h1 className="font-display text-3xl font-bold uppercase text-white">¡Pago completado!</h1>
          {order.kind === "download" ? (
            <>
              <p className="font-body text-mist">Tu foto en alta calidad está lista.</p>
              <a href={`/api/photos/${id}/treated?mode=download&order=${order.id}`} target="_blank" rel="noopener noreferrer" className={buttonClass({ className: "uppercase" })}>
                <Download className="h-5 w-5" /> Descargar foto
              </a>
            </>
          ) : (
            <>
              <p className="font-body text-mist">Muestra este código en el punto de impresión:</p>
              <p className="font-display text-4xl font-bold text-brand">#{code}</p>
              <a href={`/api/photos/${id}/treated?mode=print&order=${order.id}`} target="_blank" rel="noopener noreferrer" className={buttonClass({ variant: "secondary", size: "md", className: "uppercase" })}>
                Ver copia
              </a>
            </>
          )}
        </>
      ) : (
        <>
          <XCircle className="h-16 w-16 text-danger" />
          <h1 className="font-display text-2xl font-bold uppercase text-white">Pago no completado</h1>
          <p className="font-body text-mist">No hemos podido confirmar el pago. Si se te cobró, contacta con la organización.</p>
          <Link href={`/comprar/${id}`} className={buttonClass({ variant: "secondary", size: "md", className: "uppercase" })}>
            Reintentar
          </Link>
        </>
      )}
    </main>
  );
}
