import { NextRequest, NextResponse } from "next/server";
import { readObject } from "@/server/services/storage.service";
import { prisma } from "@/server/db";

// Sirve SOLO derivados públicos (miniatura / con marca de agua) del storage.
// Los ORIGINALES (alta calidad sin marca) nunca se sirven por aquí: solo se
// entregan tratados y previo pago vía /api/photos/[id]/treated.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ key: string[] }> },
) {
  const { key } = await params;
  const fullKey = key.join("/");

  // Bloquea servir el original de cualquier foto (anti-bypass de venta).
  const isOriginal = await prisma.photo.findFirst({
    where: { originalKey: fullKey },
    select: { id: true },
  });
  if (isOriginal) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  try {
    const { buffer, contentType } = await readObject(fullKey);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
}
