import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { getBranding } from "@/server/services/settings.service";
import { readAnyObject } from "@/server/services/storage.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/brand/logo → logo oficial subido, o la mascota placeholder por defecto.
export async function GET() {
  const branding = await getBranding();
  if (branding.logoKey) {
    const obj = await readAnyObject(branding.logoKey);
    if (obj) {
      return new NextResponse(new Uint8Array(obj.buffer), {
        headers: { "Content-Type": obj.contentType, "Cache-Control": "public, max-age=120" },
      });
    }
  }
  // Fallback: mascota blanca (placeholder).
  const svg = await fs.readFile(path.join(process.cwd(), "public", "brand", "mascot-white.svg"));
  return new NextResponse(new Uint8Array(svg), {
    headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=120" },
  });
}
