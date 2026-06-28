import sharp, { type OverlayOptions } from "sharp";

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

// ─────────── Foto tratada (descarga premium / impresión en sitio) ───────────

const GRAVITY_POS: Record<string, string> = {
  "bottom-right": "southeast",
  "bottom-left": "southwest",
  "top-right": "northeast",
  "top-left": "northwest",
  center: "center",
};

export interface TreatedOptions {
  logoPosition?: string;
  logoScalePct?: number; // % del ancho
  frameColor?: string | null;
  framePx?: number;
  sponsorLogo?: Buffer | null; // PNG/SVG del sponsor (o logo de marca)
  number?: string | null; // número de impresión a estampar
  qr?: Buffer | null; // PNG del QR identificador
}

export type Orientation = "vertical" | "horizontal" | "square";

export function detectOrientation(width?: number, height?: number): Orientation {
  if (!width || !height) return "horizontal";
  const r = width / height;
  if (r > 1.15) return "horizontal";
  if (r < 0.87) return "vertical";
  return "square";
}

/**
 * Genera la versión "tratada" en alta calidad: opcional marco + logo del sponsor
 * + (para impresión) número y QR identificador integrados en la esquina.
 * Detecta la orientación a partir de las dimensiones reales de la foto.
 */
export async function makeTreatedPhoto(
  input: Buffer,
  opts: TreatedOptions,
): Promise<{ buffer: Buffer; mime: string; orientation: Orientation }> {
  let img = sharp(input).rotate();
  const meta = await img.metadata();
  const w = meta.width ?? 1600;
  const h = meta.height ?? 1067;
  const orientation = detectOrientation(w, h);

  // Marco opcional.
  if (opts.frameColor && opts.framePx && opts.framePx > 0) {
    img = sharp(
      await img
        .extend({
          top: opts.framePx,
          bottom: opts.framePx,
          left: opts.framePx,
          right: opts.framePx,
          background: opts.frameColor,
        })
        .toBuffer(),
    );
  }

  const base = await img.toBuffer();
  const bw = (await sharp(base).metadata()).width ?? w;
  const composites: OverlayOptions[] = [];

  // Logo del sponsor.
  if (opts.sponsorLogo) {
    const logoW = Math.round(bw * ((opts.logoScalePct ?? 22) / 100));
    const logo = await sharp(opts.sponsorLogo).resize({ width: logoW }).png().toBuffer();
    composites.push({ input: logo, gravity: GRAVITY_POS[opts.logoPosition ?? "bottom-right"] ?? "southeast" });
  }

  // Número + QR (impresión): bloque blanco abajo-izquierda, dimensionado al contenido.
  if (opts.number || opts.qr) {
    const fontSize = Math.round(bw * 0.05);
    const qrSize = opts.qr ? Math.round(bw * 0.13) : 0;
    const padding = Math.round(bw * 0.02);
    const label = opts.number ? `#${opts.number}` : "";
    const textW = label ? Math.ceil(label.length * fontSize * 0.62) : 0;
    const qrB64 = opts.qr ? (await sharp(opts.qr).resize({ width: qrSize }).png().toBuffer()).toString("base64") : null;
    const blockW = padding + (qrSize ? qrSize + padding : 0) + textW + (textW ? padding : 0);
    const blockH = Math.max(qrSize, fontSize) + padding * 2;
    const textX = padding + (qrSize ? qrSize + padding : 0);
    const svg = `
      <svg width="${blockW}" height="${blockH}" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="${blockW}" height="${blockH}" rx="${padding}" fill="rgba(255,255,255,0.94)"/>
        ${qrB64 ? `<image x="${padding}" y="${padding}" width="${qrSize}" height="${qrSize}" href="data:image/png;base64,${qrB64}"/>` : ""}
        ${label ? `<text x="${textX}" y="${blockH / 2 + fontSize / 3}" font-family="DejaVu Sans, Arial, sans-serif" font-size="${fontSize}" font-weight="700" fill="#0E0E0E">${label}</text>` : ""}
      </svg>`;
    composites.push({ input: Buffer.from(svg), gravity: "southwest" });
  }

  const out = await sharp(base)
    .composite(composites)
    .jpeg({ quality: 95 })
    .toBuffer();
  return { buffer: out, mime: "image/jpeg", orientation };
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

  // Versión de DISPLAY (pública): se reduce a máx 2048px y calidad media. Es de
  // sobra para móvil, escritorio y la pantalla Live, pero NO es calidad de
  // impresión: la máxima calidad solo se entrega en la descarga de pago (treated).
  const resized = await sharp(input)
    .rotate()
    .resize({ width: 2048, height: 2048, fit: "inside", withoutEnlargement: true })
    .toBuffer();
  const meta = await sharp(resized).metadata();
  const w = meta.width ?? 1200;
  const h = meta.height ?? 800;
  const opacity = Math.min(1, Math.max(0.1, opts.opacity ?? 0.5));
  const position = (opts.position as WatermarkPosition) ?? "bottom-right";
  const gravity = GRAVITY[position] ?? "southeast";

  const overlay = watermarkSvg(w, h, opacity);
  const buffer = await sharp(resized)
    .composite([{ input: overlay, gravity }])
    .jpeg({ quality: 82 })
    .toBuffer();
  return { buffer, mime: "image/jpeg" };
}
