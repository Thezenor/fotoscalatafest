import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { hasRole } from "@/server/auth/guards";
import {
  listForModeration,
  moderatePhoto,
  type ModerationAction,
} from "@/server/services/photo.service";

// GET /api/admin/photos?status=pending → cola de moderación (rol MODERATOR+).
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!hasRole(session?.user?.role, "MODERATOR"))
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const status = req.nextUrl.searchParams.get("status");
  let photos = await listForModeration();
  if (status) photos = photos.filter((p) => p.status === status);
  return NextResponse.json({ photos });
}

// PATCH /api/admin/photos  { id, action } → aplica moderación + auditoría.
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!hasRole(session?.user?.role, "MODERATOR"))
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as {
    id?: string;
    action?: ModerationAction;
  };
  if (!body.id || !body.action)
    return NextResponse.json({ error: "bad_request" }, { status: 400 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  await moderatePhoto(body.id, body.action, { userId: session!.user!.id, ip });
  return NextResponse.json({ ok: true });
}
