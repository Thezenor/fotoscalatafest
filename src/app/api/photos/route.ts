import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import crypto from "crypto";
import {
  listApprovedPhotos,
  createUploadedPhoto,
  getActiveEvent,
} from "@/server/services/photo.service";
import { createConsent } from "@/server/services/consent.service";
import { saveObject } from "@/server/services/storage.service";
import { rateLimit, clientIpFrom } from "@/server/services/ratelimit.service";
import { enqueuePhotoProcessing } from "@/server/queue/photo-queue";
import { processPhoto } from "@/server/queue/processor";

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
  // Anti-spam: máx. 30 subidas por IP cada 10 min (fail-open si Redis cae).
  const ipForLimit = clientIpFrom(req.headers);
  const limit = await rateLimit(`upload:${ipForLimit}`, 30, 600);
  if (!limit.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

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
  // Huella anónima del subidor (forense anti-spam, sin guardar datos personales).
  const uploaderHash = crypto
    .createHash("sha256")
    .update(`${ip ?? ""}|${req.headers.get("user-agent") ?? ""}`)
    .digest("hex")
    .slice(0, 32);

  // Re-encode con sharp: corrige orientación y ELIMINA EXIF/metadatos.
  const input = Buffer.from(await file.arrayBuffer());
  const img = sharp(input).rotate();
  const meta = await img.metadata();
  const clean = await img.toBuffer();
  const originalKey = await saveObject(clean, file.type);

  // Registro de consentimiento legal.
  const consent = await createConsent({
    eventId: event.id,
    acceptedRights: acceptRights,
    confirmedAdult: acceptAge,
    ip,
    userAgent: req.headers.get("user-agent"),
  });

  // Foto en PENDING; el procesado (miniatura + marca de agua + IA) va aparte.
  const photo = await createUploadedPhoto({
    stageSlug,
    originalKey,
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
    uploaderHash,
  });

  // Asíncrono: encola el procesado (worker). Si no hay cola, procesa inline.
  const queued = await enqueuePhotoProcessing(photo.id);
  if (!queued) {
    await processPhoto(photo.id);
  }

  return NextResponse.json(
    { ok: true, id: photo.id, status: "pending", queued },
    { status: 201 },
  );
}
