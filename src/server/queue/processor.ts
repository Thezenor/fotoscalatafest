import { prisma } from "@/server/db";
import { readObject, saveObject } from "@/server/services/storage.service";
import { makeThumbnail, makeWatermarked } from "@/server/services/image.service";
import { analyzeImage } from "@/server/services/ai-moderation.service";
import { applyAiModeration } from "@/server/services/photo.service";

/**
 * Procesa una foto subida: miniatura + marca de agua (según config del evento)
 * + moderación IA. Idempotente-ish: se puede reintentar. Lo usa el worker
 * (asíncrono) y también el fallback inline de la subida.
 */
export async function processPhoto(photoId: string): Promise<void> {
  const photo = await prisma.photo.findUnique({
    where: { id: photoId },
    include: { event: true },
  });
  if (!photo) return;
  // Idempotencia: si ya se generó la miniatura, no reprocesar (evita doble
  // trabajo si coinciden worker + fallback inline).
  if (photo.thumbnailKey) return;

  // Miniatura + marca de agua (no bloquea si falla; se conserva el original).
  try {
    const { buffer } = await readObject(photo.originalKey);
    const thumb = await makeThumbnail(buffer);
    const thumbnailKey = await saveObject(thumb.buffer, thumb.mime);
    const wm = await makeWatermarked(buffer, {
      enabled: photo.event.watermarkEnabled,
      position: photo.event.watermarkPosition,
      opacity: photo.event.watermarkOpacity,
    });
    const watermarkedKey = wm ? await saveObject(wm.buffer, wm.mime) : null;
    await prisma.photo.update({
      where: { id: photoId },
      data: { thumbnailKey, watermarkedKey },
    });

    // Moderación IA (degrada a PENDING si no hay credenciales).
    const ai = await analyzeImage(buffer);
    await applyAiModeration(photoId, ai, {
      autoApproveOnAiClean: photo.event.autoApproveOnAiClean,
    });
  } catch (err) {
    console.error("[processor] fallo procesando foto", photoId, err);
  }
}
