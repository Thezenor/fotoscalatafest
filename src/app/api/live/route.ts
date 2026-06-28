import { NextResponse } from "next/server";
import {
  listOnScreenPhotos,
  listApprovedPhotos,
  listFeaturedPhotos,
} from "@/server/services/photo.service";

// GET /api/live → fotos para la pantalla del recinto (onScreen, o aprobadas).
// TODO(backend): SSE/WebSocket/polling para refresco en tiempo real.
export async function GET() {
  const [onScreen, approved, featured] = await Promise.all([
    listOnScreenPhotos(),
    listApprovedPhotos(),
    listFeaturedPhotos(),
  ]);
  return NextResponse.json({ photos: onScreen.length ? onScreen : approved, featured });
}
