import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import {
  listApprovedPhotos,
  createUploadedPhoto,
  getActiveEvent,
  applyAiModeration,
} from "@/server/services/photo.service";
import { createConsent } from "@/server/services/consent.service";
import { saveObject } from "@/server/services/storage.service";
import { makeThumbnail, makeWatermarked } from "@/server/services/image.service";
import { analyzeImage } from "@/server/services/ai-moderation.service";

export const runtime = "nodejs";

const MAX_BYTES = 12 * 1024 * 1024; // 12 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif"];

// GET /api/photos?stage=&day= → galería pública (solo APPROVED).
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const photos = await listApprovedPhotos({
    stageSlug: searchParams.get("stage") ?? undefined,
    day: searchParams.get("day") ?? undefined,
  });
  return NextResponse.json({ photos });
}

// POST /api/photos (multipart) → subida real. La foto entra como PENDING.
export async function POST(req: NextRequest) {
  const event = await getActiveEvent();
  if (!event) return NextResponse.json({ error: "no_active_event" }, { status: 400 });

  const form = await req.formData();
  const file = form.get("file");
  const stageSlug = String(form.get("stage") ?? "");
  const acceptRights = form.get("acceptRights") === "true";
  const acceptAge = form.get("acceptAge") === "true";

  // Consentimiento obligatorio (validado en backend, no solo en el front).
  if (!acceptRights || !acceptAge) {
    return NextResponse.json({ error: "consent_required" }, { status: 400 });
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file_required" }, { status: 400 });
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: "invalid_type" }, { status: 415 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "too_large" }, { status: 413 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;

  // Re-encode con sharp: corrige orientación y ELIMINA EXIF/metadatos.
  const input = Buffer.from(await file.arrayBuffer());
  const img = sharp(input).rotate();
  const meta = await img.metadata();
  const clean = await img.toBuffer();
  const originalKey = await saveObject(clean, file.type);

  // Miniatura (galería) + versión con marca de agua (pública), según config del evento.
  let thumbnailKey: string | null = null;
  let watermarkedKey: string | null = null;
  try {
    const thumb = await makeThumbnail(clean);
    thumbnailKey = await saveObject(thumb.buffer, thumb.mime);
    const wm = await makeWatermarked(clean, {
      enabled: event.watermarkEnabled,
      position: event.watermarkPosition,
      opacity: event.watermarkOpacity,
    });
    if (wm) watermarkedKey = await saveObject(wm.buffer, wm.mime);
  } catch (err) {
    console.error("[upload] fallo procesando imagen (thumb/watermark)", err);
    // No bloquea la subida: se conserva el original.
  }

  // Registro de consentimiento legal.
  const consent = await createConsent({
    eventId: event.id,
    acceptedRights: acceptRights,
    confirmedAdult: acceptAge,
    ip,
    userAgent: req.headers.get("user-agent"),
  });

  const photo = await createUploadedPhoto({
    stageSlug,
    originalKey,
    thumbnailKey,
    watermarkedKey,
    mimeType: file.type,
    width: meta.width,
    height: meta.height,
    sizeBytes: clean.length,
    author: {
      name: String(form.get("name") ?? "") || undefined,
      instagram: String(form.get("instagram") ?? "") || undefined,
      tiktok: String(form.get("tiktok") ?? "") || undefined,
    },
    comment: String(form.get("comment") ?? "") || undefined,
    consentId: consent.id,
    ip,
  });

  // Moderación IA (Google Vision). Si no hay credenciales, queda PENDING (manual).
  // TODO(escala): mover a un worker BullMQ para no bloquear la respuesta.
  try {
    const ai = await analyzeImage(clean);
    await applyAiModeration(photo.id, ai, {
      autoApproveOnAiClean: event.autoApproveOnAiClean,
    });
  } catch (err) {
    console.error("[upload] moderación IA falló (queda PENDING)", err);
  }

  return NextResponse.json({ ok: true, id: photo.id, status: "pending" }, { status: 201 });
}
