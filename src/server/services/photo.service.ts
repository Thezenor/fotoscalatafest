import { prisma } from "@/server/db";
import { publicUrl } from "@/server/services/storage.service";
import { logAudit } from "@/server/services/audit.service";
import type { AiResult } from "@/server/services/ai-moderation.service";
import type { Photo as PhotoDTO, Day } from "@/lib/mock-data";
import type { Photo as DbPhoto, Stage, PhotoStatus, Prisma } from "@prisma/client";

type DbPhotoWithStage = DbPhoto & { stage: Stage | null };

/** Mapea la fila de Prisma al DTO que consumen los componentes del diseño. */
function toDTO(p: DbPhotoWithStage): PhotoDTO {
  const status: PhotoDTO["status"] =
    p.status === "APPROVED" ? "approved" : p.status === "REJECTED" ? "rejected" : "pending";
  const url = publicUrl(p.watermarkedKey ?? p.originalKey) ?? "";
  return {
    id: p.id,
    url,
    thumbUrl: publicUrl(p.thumbnailKey ?? p.originalKey) ?? url,
    width: p.width ?? 900,
    height: p.height ?? 600,
    stageId: p.stage?.slug ?? "",
    stageName: p.stage?.name ?? "",
    day: (p.day as Day) ?? "VIE",
    time: p.timeLabel ?? undefined,
    author: {
      name: p.authorName ?? undefined,
      instagram: p.authorInstagram ?? undefined,
      tiktok: p.authorTiktok ?? undefined,
    },
    comment: p.comment ?? undefined,
    status,
    featured: p.featured,
    onScreen: p.onScreen,
    createdAt: p.createdAt.toISOString(),
  };
}

/** Evento activo (la plataforma opera sobre un festival a la vez). */
export async function getActiveEvent() {
  return prisma.event.findFirst({ where: { isActive: true }, orderBy: { createdAt: "desc" } });
}

export async function listStages() {
  const event = await getActiveEvent();
  if (!event) return [];
  return prisma.stage.findMany({ where: { eventId: event.id }, orderBy: { order: "asc" } });
}

export async function getStageBySlug(slug: string) {
  const event = await getActiveEvent();
  if (!event) return null;
  return prisma.stage.findFirst({ where: { eventId: event.id, slug } });
}

/** Galería pública: solo APPROVED. Filtros opcionales por escenario (slug) y día. */
export async function listApprovedPhotos(opts?: { stageSlug?: string; day?: string }) {
  const event = await getActiveEvent();
  if (!event) return [];
  const rows = await prisma.photo.findMany({
    where: {
      eventId: event.id,
      status: "APPROVED",
      ...(opts?.day ? { day: opts.day } : {}),
      ...(opts?.stageSlug ? { stage: { slug: opts.stageSlug } } : {}),
    },
    include: { stage: true },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toDTO);
}

export async function listFeaturedPhotos() {
  const event = await getActiveEvent();
  if (!event) return [];
  const rows = await prisma.photo.findMany({
    where: { eventId: event.id, status: "APPROVED", featured: true },
    include: { stage: true },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toDTO);
}

export async function listOnScreenPhotos() {
  const event = await getActiveEvent();
  if (!event) return [];
  const rows = await prisma.photo.findMany({
    where: { eventId: event.id, status: "APPROVED", onScreen: true },
    include: { stage: true },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toDTO);
}

export async function getPublicPhoto(id: string) {
  const row = await prisma.photo.findUnique({ where: { id }, include: { stage: true } });
  return row ? toDTO(row) : null;
}

/** Cola de moderación (todas las del evento, para el board admin). */
export async function listForModeration() {
  const event = await getActiveEvent();
  if (!event) return [];
  const rows = await prisma.photo.findMany({
    where: { eventId: event.id },
    include: { stage: true },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });
  return rows.map(toDTO);
}

export type ModerationAction = "approve" | "reject" | "feature" | "screen";

/** Aplica una acción de moderación y registra auditoría. */
export async function moderatePhoto(
  id: string,
  action: ModerationAction,
  opts: { userId?: string | null; ip?: string | null },
) {
  const data: Partial<Pick<DbPhoto, "status" | "featured" | "onScreen" | "moderatedById" | "moderatedAt">> = {
    moderatedById: opts.userId ?? null,
    moderatedAt: new Date(),
  };
  let auditAction = "PHOTO_MODERATED";

  if (action === "approve") {
    data.status = "APPROVED" as PhotoStatus;
    auditAction = "PHOTO_APPROVED";
  } else if (action === "reject") {
    data.status = "REJECTED" as PhotoStatus;
    auditAction = "PHOTO_REJECTED";
  } else if (action === "feature") {
    data.featured = true;
    data.status = "APPROVED" as PhotoStatus; // destacar implica aprobar
    auditAction = "PHOTO_FEATURED";
  } else if (action === "screen") {
    data.onScreen = true;
    data.status = "APPROVED" as PhotoStatus; // enviar a pantalla implica aprobar
    auditAction = "PHOTO_ON_SCREEN";
  }

  const updated = await prisma.photo.update({ where: { id }, data });
  await logAudit({
    action: auditAction,
    entityType: "Photo",
    entityId: id,
    userId: opts.userId ?? null,
    ip: opts.ip ?? null,
    metadata: { action },
  });
  return updated;
}

/** Crea una foto subida (estado PENDING). */
export async function createUploadedPhoto(input: {
  stageSlug: string;
  originalKey: string;
  thumbnailKey?: string | null;
  watermarkedKey?: string | null;
  mimeType: string;
  width?: number;
  height?: number;
  sizeBytes?: number;
  author?: { name?: string; instagram?: string; tiktok?: string };
  comment?: string;
  consentId?: string | null;
  ip?: string | null;
}) {
  const event = await getActiveEvent();
  if (!event) throw new Error("NO_ACTIVE_EVENT");
  const stage = await prisma.stage.findFirst({
    where: { eventId: event.id, slug: input.stageSlug },
  });

  const photo = await prisma.photo.create({
    data: {
      eventId: event.id,
      stageId: stage?.id ?? null,
      status: "PENDING",
      originalKey: input.originalKey,
      thumbnailKey: input.thumbnailKey ?? null,
      watermarkedKey: input.watermarkedKey ?? null,
      mimeType: input.mimeType,
      width: input.width ?? null,
      height: input.height ?? null,
      sizeBytes: input.sizeBytes ?? null,
      authorName: input.author?.name ?? null,
      authorInstagram: input.author?.instagram ?? null,
      authorTiktok: input.author?.tiktok ?? null,
      comment: input.comment ?? null,
      consentId: input.consentId ?? null,
      uploaderIp: input.ip ?? null,
    },
  });

  await logAudit({
    action: "PHOTO_UPLOADED",
    entityType: "Photo",
    entityId: photo.id,
    ip: input.ip ?? null,
    metadata: { stage: input.stageSlug },
  });
  return photo;
}

/**
 * Aplica el resultado de la IA a una foto y decide su estado:
 * - NSFW / VIOLENCE / MINOR_SUSPECTED → AI_FLAGGED (revisión humana forzada).
 * - CLEAN → APPROVED si el evento auto-aprueba, si no AI_APPROVED (espera manual).
 * - ERROR / skipped → se queda PENDING (cola manual). Nunca auto-aprueba ante fallo.
 */
export async function applyAiModeration(
  photoId: string,
  result: AiResult,
  opts: { autoApproveOnAiClean: boolean },
) {
  let status: PhotoStatus | undefined;
  if (result.verdict === "NSFW" || result.verdict === "VIOLENCE" || result.verdict === "MINOR_SUSPECTED") {
    status = "AI_FLAGGED";
  } else if (result.verdict === "CLEAN") {
    status = opts.autoApproveOnAiClean ? "APPROVED" : "AI_APPROVED";
  } // PENDING/ERROR → no cambia el estado (sigue PENDING)

  await prisma.photo.update({
    where: { id: photoId },
    data: {
      aiVerdict: result.verdict,
      aiScore: (result.scores as Prisma.InputJsonValue) ?? undefined,
      aiReviewedAt: result.skipped ? null : new Date(),
      ...(status ? { status } : {}),
    },
  });

  await logAudit({
    action: "PHOTO_AI_REVIEWED",
    entityType: "Photo",
    entityId: photoId,
    metadata: { verdict: result.verdict, skipped: result.skipped, status: status ?? "PENDING" },
  });
}
