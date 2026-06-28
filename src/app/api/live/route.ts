import { NextResponse } from "next/server";
import {
  listOnScreenPhotos,
  listApprovedPhotos,
  listFeaturedPhotos,
} from "@/server/services/photo.service";

// GET /api/live → fotos para la pantalla del recinto (onScreen, o aprobadas recientes).
// Se limita el volumen y se cachea 15s: cada pantalla sondea cada 20s.
export async function GET() {
  const onScreen = await listOnScreenPhotos();
  // Solo se trae la galería completa (limitada) si no hay fotos marcadas a pantalla.
  const [photos, featured] = await Promise.all([
    onScreen.length ? Promise.resolve(onScreen.slice(0, 60)) : listApprovedPhotos({ limit: 60 }),
    listFeaturedPhotos(),
  ]);
  return NextResponse.json(
    { photos, featured: featured.slice(0, 12) },
    { headers: { "Cache-Control": "public, max-age=15, stale-while-revalidate=30" } },
  );
}
