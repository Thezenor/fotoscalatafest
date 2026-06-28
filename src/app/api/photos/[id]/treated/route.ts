import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { generateTreated } from "@/server/services/print.service";
import { getPrintConfig } from "@/server/services/settings.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/photos/:id/treated?mode=download|print → foto tratada en alta calidad.
// Si la venta de ese modo está ACTIVA, exige un pedido PAGADO; si está
// desactivada (aún no se cobra), se sirve libremente (para probar la función).
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const mode = req.nextUrl.searchParams.get("mode") === "print" ? "print" : "download";

  const cfg = await getPrintConfig();
  const saleOn = mode === "download" ? cfg.downloadEnabled : cfg.printEnabled;
  if (saleOn) {
    // Gate por-comprador: exige el id de SU pedido pagado (no basta con que
    // exista cualquier pedido pagado de la foto). El id es un cuid no enumerable.
    const orderId = req.nextUrl.searchParams.get("order");
    const paid = orderId
      ? await prisma.printOrder.findFirst({
          where: { id: orderId, photoId: id, kind: mode, status: "PAID" },
          select: { id: true },
        })
      : null;
    if (!paid) {
      return NextResponse.json({ error: "payment_required" }, { status: 402 });
    }
  }

  const treated = await generateTreated(id, mode);
  if (!treated) return NextResponse.json({ error: "not_found" }, { status: 404 });

  return new NextResponse(new Uint8Array(treated.buffer), {
    headers: {
      "Content-Type": treated.mime,
      "Content-Disposition": `inline; filename="calatafest-${id}.jpg"`,
      "Cache-Control": "private, max-age=60",
    },
  });
}
