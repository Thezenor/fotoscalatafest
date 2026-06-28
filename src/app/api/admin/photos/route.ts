import { NextRequest, NextResponse } from "next/server";
import { getPendingPhotos } from "@/lib/mock-data";
import { auth } from "@/auth";

// GET /api/admin/photos?status=pending → cola de moderación.
// PATCH → cambia estado/featured/onScreen.
// TODO(backend): proteger por rol (ADMIN/MODERATOR), query/update Prisma + AuditLog.
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const status = req.nextUrl.searchParams.get("status") ?? "pending";
  const photos = status === "pending" ? getPendingPhotos() : [];
  return NextResponse.json({ photos });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  // TODO(backend): aplicar { status, featured, onScreen } sobre Photo + registrar auditoría.
  return NextResponse.json({ ok: true, applied: body });
}
