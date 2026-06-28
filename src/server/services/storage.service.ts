import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

/**
 * Abstracción de almacenamiento de ficheros. Hoy: volumen local/Railway.
 * Para migrar a R2/S3 basta con implementar otro driver con la misma interfaz
 * y cambiar STORAGE_DRIVER, sin tocar el resto del código.
 */

const DRIVER = process.env.STORAGE_DRIVER ?? "railway-volume";
const BASE = process.env.STORAGE_PATH ?? "./.data/uploads";

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};

export function extFromMime(mime: string): string {
  return EXT_BY_MIME[mime] ?? "bin";
}

function safeJoin(key: string): string {
  // Evita path traversal: normaliza y prohíbe salir de BASE.
  const target = path.normalize(path.join(BASE, key));
  const baseResolved = path.resolve(BASE);
  if (!path.resolve(target).startsWith(baseResolved)) {
    throw new Error("INVALID_KEY");
  }
  return target;
}

/** Guarda un buffer y devuelve su key (ruta relativa dentro del storage). */
export async function saveObject(buffer: Buffer, mime: string): Promise<string> {
  if (DRIVER !== "railway-volume") {
    // TODO(backend): driver R2/S3 (presigned upload) aquí.
    throw new Error(`STORAGE_DRIVER no soportado: ${DRIVER}`);
  }
  const key = `${crypto.randomUUID()}.${extFromMime(mime)}`;
  const target = safeJoin(key);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, buffer);
  return key;
}

/** Lee un objeto por su key (para servirlo). */
export async function readObject(
  key: string,
): Promise<{ buffer: Buffer; contentType: string }> {
  const target = safeJoin(key);
  const buffer = await fs.readFile(target);
  const ext = path.extname(key).slice(1).toLowerCase();
  const contentType =
    Object.entries(EXT_BY_MIME).find(([, e]) => e === ext)?.[0] ??
    "application/octet-stream";
  return { buffer, contentType };
}

/** URL pública para servir el objeto (ruta del route handler). */
export function publicUrl(key: string | null | undefined): string | null {
  if (!key) return null;
  // Los seeds de demo usan rutas absolutas a /demo: se devuelven tal cual.
  if (key.startsWith("/")) return key;
  return `/api/files/${key}`;
}
