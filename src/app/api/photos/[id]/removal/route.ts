import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/server/db";
import { logAudit } from "@/server/services/audit.service";

const schema = z.object({
  email: z.string().email(),
  reason: z.string().min(3).max(2000),
});

// POST /api/photos/:id/removal → crea una solicitud de retirada (RGPD).
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const photo = await prisma.photo.findUnique({ where: { id }, select: { id: true } });
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;

  const reqRow = await prisma.removalRequest.create({
    data: {
      photoId: photo?.id ?? null,
      email: parsed.data.email,
      reason: parsed.data.reason,
      ip,
    },
  });

  await logAudit({
    action: "REMOVAL_REQUESTED",
    entityType: "Photo",
    entityId: id,
    ip,
    metadata: { removalId: reqRow.id },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
