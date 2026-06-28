import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { requireRole } from "@/server/auth/guards";
import { prisma } from "@/server/db";
import { ensurePrintCode } from "@/server/services/print.service";
import { AutoPrintView } from "./auto-print";

export const dynamic = "force-dynamic";

export default async function PrintNowPage({
  params,
}: {
  params: Promise<{ locale: string; orderId: string }>;
}) {
  const { locale, orderId } = await params;
  setRequestLocale(locale);
  await requireRole("MODERATOR");

  const order = await prisma.printOrder.findUnique({ where: { id: orderId } });
  if (!order || order.kind !== "print" || !order.photoId) notFound();
  // Solo copias pagadas (o ya impresas, por si se reimprime).
  if (order.status !== "PAID" && order.status !== "FULFILLED") notFound();

  const code = (await ensurePrintCode(order.photoId)) ?? order.photoId.slice(0, 6).toUpperCase();
  const imageUrl = `/api/photos/${order.photoId}/treated?mode=print&order=${order.id}`;

  return <AutoPrintView imageUrl={imageUrl} orderId={order.id} code={code} />;
}
