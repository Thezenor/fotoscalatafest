import { NextRequest, NextResponse } from "next/server";
import { getPhoto } from "@/lib/mock-data";

// GET /api/photos/:id → foto individual.
// TODO(backend): query Prisma; 404 si no existe o no está aprobada.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const photo = getPhoto(id);
  if (!photo) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ photo });
}
