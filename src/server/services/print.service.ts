import crypto from "crypto";
import { promises as fs } from "fs";
import path from "path";
import QRCode from "qrcode";
import { prisma } from "@/server/db";
import { readAnyObject } from "@/server/services/storage.service";
import { makeTreatedPhoto, detectOrientation } from "@/server/services/image.service";
import { getBranding, getTemplates } from "@/server/services/settings.service";
import { siteUrl } from "@/lib/seo";

/** Código corto único para identificar la foto en impresión (número + QR). */
export async function ensurePrintCode(photoId: string): Promise<string | null> {
  const photo = await prisma.photo.findUnique({ where: { id: photoId }, select: { printCode: true } });
  if (!photo) return null;
  if (photo.printCode) return photo.printCode;
  for (let i = 0; i < 5; i++) {
    const code = crypto.randomBytes(4).toString("hex").slice(0, 6).toUpperCase();
    try {
      await prisma.photo.update({ where: { id: photoId }, data: { printCode: code } });
      return code;
    } catch {
      // colisión: reintenta
    }
  }
  return null;
}

/** Logo de marca/sponsor para estampar (logo subido o mascota por defecto). */
async function brandLogoBuffer(): Promise<Buffer | null> {
  const branding = await getBranding();
  if (branding.logoKey) {
    const obj = await readAnyObject(branding.logoKey);
    if (obj) return obj.buffer;
  }
  try {
    return await fs.readFile(path.join(process.cwd(), "public", "brand", "mascot-white.svg"));
  } catch {
    return null;
  }
}

/**
 * Genera la foto tratada en alta calidad.
 * - mode "download": original + logo del sponsor (sin número/QR).
 * - mode "print": además número + QR identificador integrados (impresión en sitio).
 */
export async function generateTreated(photoId: string, mode: "download" | "print") {
  // Nunca tratar/servir el original de una foto no aprobada (salta la moderación).
  const photo = await prisma.photo.findFirst({ where: { id: photoId, status: "APPROVED" } });
  if (!photo) return null;

  const obj = await readAnyObject(photo.originalKey);
  if (!obj) return null;
  const original = obj.buffer;
  const orientation = detectOrientation(photo.width ?? undefined, photo.height ?? undefined);
  const templates = await getTemplates();
  const tpl = orientation === "vertical" ? templates.vertical : templates.horizontal;

  const sponsorLogo = tpl.showSponsorLogo ? await brandLogoBuffer() : null;

  let number: string | null = null;
  let qr: Buffer | null = null;
  if (mode === "print") {
    const code = (await ensurePrintCode(photoId)) ?? photo.id.slice(0, 6).toUpperCase();
    number = code;
    qr = await QRCode.toBuffer(`${siteUrl()}/foto/${photoId}`, { margin: 1, width: 600 });
  }

  return makeTreatedPhoto(original, {
    logoPosition: tpl.logoPosition,
    logoScalePct: tpl.logoScalePct,
    frameColor: tpl.frameColor,
    framePx: tpl.framePx,
    sponsorLogo,
    number,
    qr,
  });
}
