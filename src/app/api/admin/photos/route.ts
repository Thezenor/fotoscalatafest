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

  const sp = req.nextUrl.searchParams;
  const limit = Math.min(90, Math.max(1, Number(sp.get("limit")) || 48));
  const offset = Math.max(0, Number(sp.get("offset")) || 0);
  const rows = await listForModeration({
    status: sp.get("status") ?? undefined,
    stageSlug: sp.get("stage") ?? undefined,
    day: sp.get("day") ?? undefined,
    limit: limit + 1,
    offset,
  });
  const hasMore = rows.length > limit;
  return NextResponse.json({ photos: rows.slice(0, limit), hasMore });
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
