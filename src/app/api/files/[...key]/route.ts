import { NextRequest, NextResponse } from "next/server";
import { readObject } from "@/server/services/storage.service";

// Sirve los ficheros del storage (volumen). En producción con CDN (R2/S3)
// esto se sustituye por URLs directas del bucket.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ key: string[] }> },
) {
  const { key } = await params;
  try {
    const { buffer, contentType } = await readObject(key.join("/"));
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
