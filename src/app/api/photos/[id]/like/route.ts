import { NextRequest, NextResponse } from "next/server";
import { likePhoto } from "@/server/services/photo.service";
import { rateLimit, clientIpFrom } from "@/server/services/ratelimit.service";

export const runtime = "nodejs";

// POST /api/photos/:id/like → suma un me gusta (solo fotos aprobadas).
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Anti-spam: máx. 60 likes por IP cada 10 min.
  if (!(await rateLimit(`like:${clientIpFrom(req.headers)}`, 60, 600)).ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }
  const { id } = await params;
  const likes = await likePhoto(id);
  if (likes === null) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ likes });
}
