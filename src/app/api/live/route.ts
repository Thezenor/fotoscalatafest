import { NextResponse } from "next/server";
import { getOnScreenPhotos, getApprovedPhotos, getFeaturedPhotos } from "@/lib/mock-data";

// GET /api/live → fotos para la pantalla del recinto (onScreen + aprobadas).
// TODO(backend): idealmente SSE/WebSocket/polling para refresco en tiempo real.
export async function GET() {
  const onScreen = getOnScreenPhotos();
  return NextResponse.json({
    photos: onScreen.length ? onScreen : getApprovedPhotos(),
    featured: getFeaturedPhotos(),
  });
}
