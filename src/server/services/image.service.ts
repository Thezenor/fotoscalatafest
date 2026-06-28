import sharp from "sharp";

/**
 * Procesado de imágenes con sharp: miniatura optimizada y marca de agua
 * configurable. Pensado para ejecutarse en la subida (hoy inline; en el futuro
 * en un worker BullMQ — ver ARCHITECTURE.md).
 */

export type WatermarkPosition =
  | "bottom-right"
  | "bottom-left"
  | "top-right"
  | "top-left"
  | "center";

const GRAVITY: Record<WatermarkPosition, string> = {
  "bottom-right": "southeast",
  "bottom-left": "southwest",
  "top-right": "northeast",
  "top-left": "northwest",
  center: "center",
};

/** Miniatura WebP (para grids/galería). Mantiene proporción, máx 900px de ancho. */
export async function makeThumbnail(
  input: Buffer,
): Promise<{ buffer: Buffer; mime: string }> {
  const buffer = await sharp(input)
    .rotate()
    .resize({ width: 900, withoutEnlargement: true })
    .webp({ quality: 72 })
    .toBuffer();
  return { buffer, mime: "image/webp" };
}

// Trazos de la mascota (auriculares 8-bit, viewBox 0 0 120 112). Sin dependencia
// de fuentes para el icono; el wordmark usa sans-serif del sistema.
const MASCOT = `
  <g fill="none" stroke="#ffffff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
    <path d="M16 64 V46 a44 44 0 0 1 88 0 V64"/>
    <rect x="8" y="60" width="20" height="36" rx="9"/>
    <rect x="92" y="60" width="20" height="36" rx="9"/>
    <rect x="33" y="40" width="54" height="54" rx="11"/>
    <circle cx="49" cy="60" r="4" fill="#ffffff" stroke="none"/>
    <circle cx="71" cy="60" r="4" fill="#ffffff" stroke="none"/>
    <rect x="51" y="74" width="18" height="13" rx="3.5"/>
  </g>`;

function watermarkSvg(imgW: number, imgH: number, opacity: number): Buffer {
  // Escala la marca relativa al tamaño de la imagen + padding uniforme.
  const markH = Math.max(26, Math.round(Math.min(imgW, imgH) * 0.06));
  const pad = Math.round(markH * 0.7);
  const mascotW = Math.round((markH * 120) / 112);
  const gap = Math.round(markH * 0.35);
  const fontSize = Math.round(markH * 0.85);
  const text = "CALATAFEST";
  const textW = Math.round(text.length * fontSize * 0.62);
  const contentW = mascotW + gap + textW;
  const canvasW = contentW + pad * 2;
  const canvasH = markH + pad * 2;
  const scale = markH / 112;

  return Buffer.from(`
    <svg width="${canvasW}" height="${canvasH}" viewBox="0 0 ${canvasW} ${canvasH}" xmlns="http://www.w3.org/2000/svg">
      <g opacity="${opacity}" transform="translate(${pad},${pad})" style="filter: drop-shadow(0 1px 2px rgba(0,0,0,0.6))">
        <g transform="scale(${scale})">${MASCOT}</g>
        <text x="${mascotW + gap}" y="${Math.round(markH * 0.78)}"
              font-family="DejaVu Sans, Liberation Sans, Arial, Helvetica, sans-serif" font-size="${fontSize}"
              font-weight="700" fill="#ffffff" letter-spacing="0.5">${text}</text>
      </g>
    </svg>`);
}

/**
 * Aplica marca de agua según la configuración del evento. Si está deshabilitada,
 * devuelve null (se mostrará el original).
 */
export async function makeWatermarked(
  input: Buffer,
  opts: { enabled: boolean; position?: string | null; opacity?: number | null },
): Promise<{ buffer: Buffer; mime: string } | null> {
  if (!opts.enabled) return null;

  const base = sharp(input).rotate();
  const meta = await base.metadata();
  const w = meta.width ?? 1200;
  const h = meta.height ?? 800;
  const opacity = Math.min(1, Math.max(0.1, opts.opacity ?? 0.5));
  const position = (opts.position as WatermarkPosition) ?? "bottom-right";
  const gravity = GRAVITY[position] ?? "southeast";

  const overlay = watermarkSvg(w, h, opacity);
  const buffer = await base
    .composite([{ input: overlay, gravity }])
    .jpeg({ quality: 88 })
    .toBuffer();
  return { buffer, mime: "image/jpeg" };
}
