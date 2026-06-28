import { NextRequest, NextResponse } from "next/server";
import { getApprovedPhotos } from "@/lib/mock-data";

// GET /api/photos?status=approved&stage=&day= → galería pública.
// TODO(backend): query Prisma (Photo where status=APPROVED ...) + cache/ISR.
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const stage = searchParams.get("stage");
  const day = searchParams.get("day");

  let photos = getApprovedPhotos();
  if (stage) photos = photos.filter((p) => p.stageId === stage);
  if (day) photos = photos.filter((p) => p.day === day);

  return NextResponse.json({ photos });
}

// POST /api/photos (multipart) → subida; la foto entra como "pending".
// TODO(backend): validar archivo (MIME/tamaño), re-encode con sharp (quita EXIF),
// subir al storage (StorageService), crear Photo PENDING + encolar moderación IA.
export async function POST() {
  return NextResponse.json(
    {
      ok: true,
      status: "pending",
      message: "Foto recibida (stub). Integrar storage + moderación real.",
    },
    { status: 201 },
  );
}
