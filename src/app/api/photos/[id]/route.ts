import { NextRequest, NextResponse } from "next/server";
import { getPublicPhoto } from "@/server/services/photo.service";

// GET /api/photos/:id → foto pública (Prisma).
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const photo = await getPublicPhoto(id);
  if (!photo) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ photo });
}
