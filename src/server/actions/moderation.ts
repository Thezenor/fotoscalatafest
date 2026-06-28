"use server";

import { headers } from "next/headers";
import { requireRole } from "@/server/auth/guards";
import { prisma } from "@/server/db";
import { moderatePhoto, type ModerationAction } from "@/server/services/photo.service";
import { logAudit } from "@/server/services/audit.service";

async function clientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? null;
}

/** Aplica una acción de moderación sobre una foto (requiere rol MODERATOR+). */
export async function moderateAction(photoId: string, action: ModerationAction) {
  const user = await requireRole("MODERATOR");
  await moderatePhoto(photoId, action, { userId: user.id, ip: await clientIp() });
  return { ok: true };
}

/** Deshace una acción: la foto vuelve a la cola (PENDING) sin destacado/pantalla. */
export async function revertModerationAction(photoId: string) {
  const user = await requireRole("MODERATOR");
  await prisma.photo.update({
    where: { id: photoId },
    data: { status: "PENDING", featured: false, onScreen: false },
  });
  await logAudit({
    action: "PHOTO_MODERATION_UNDONE",
    entityType: "Photo",
    entityId: photoId,
    userId: user.id,
    ip: await clientIp(),
  });
  return { ok: true };
}
