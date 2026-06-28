import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { readObject } from "@/server/services/storage.service";
import { prisma } from "@/server/db";

// Caché en memoria del chequeo "¿es un original?" para no golpear Postgres en
// cada imagen (las keys son inmutables: el resultado no cambia). TTL 10 min.
const originalCheck = new Map<string, { orig: boolean; exp: number }>();
const TTL = 600_000;

async function isOriginalKey(fullKey: string): Promise<boolean> {
  const hit = originalCheck.get(fullKey);
  if (hit && hit.exp > Date.now()) return hit.orig;
  const row = await prisma.photo.findFirst({ where: { originalKey: fullKey }, select: { id: true } });
  const orig = !!row;
  if (originalCheck.size > 5000) originalCheck.clear();
  originalCheck.set(fullKey, { orig, exp: Date.now() + TTL });
  return orig;
}

// Sirve SOLO derivados públicos (miniatura / con marca de agua) del storage.
// Los ORIGINALES (alta calidad sin marca) nunca se sirven por aquí: solo se
// entregan tratados y previo pago vía /api/photos/[id]/treated.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ key: string[] }> },
) {
  const { key } = await params;
  const fullKey = key.join("/");

  // Bloquea servir el original de cualquier foto (anti-bypass de venta).
  if (await isOriginalKey(fullKey)) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  // ETag estable (la key es inmutable) → responde 304 sin recargar el cuerpo.
  const etag = `"${crypto.createHash("sha1").update(fullKey).digest("hex").slice(0, 16)}"`;
  if (req.headers.get("if-none-match") === etag) {
    return new NextResponse(null, {
      status: 304,
      headers: { ETag: etag, "Cache-Control": "public, max-age=31536000, immutable" },
    });
  }

  try {
    const { buffer, contentType } = await readObject(fullKey);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        ETag: etag,
      },
    });
  } catch {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
}
