import type { AiVerdict } from "@prisma/client";
import { getAiSettings } from "@/server/services/settings.service";

/**
 * Moderación automática con Google Cloud Vision (SafeSearch + Face Detection).
 * Las credenciales se toman de Ajustes (superadmin → IA) o, en su defecto, de
 * variables de entorno. Degrada con elegancia: sin credenciales/desactivada,
 * NO analiza y la foto queda PENDING (revisión manual). Ver AI_MODERATION.md.
 */

export interface AiResult {
  verdict: AiVerdict;
  scores: Record<string, unknown> | null;
  skipped: boolean;
}

/** Devuelve las credenciales efectivas (Ajustes DB → entorno). */
async function resolveCredentials(): Promise<{ enabled: boolean; credentials: string | null; adc: boolean }> {
  const s = await getAiSettings();
  const credentials = s.googleCredentials || process.env.GOOGLE_VISION_CREDENTIALS || null;
  const adc = !!process.env.GOOGLE_APPLICATION_CREDENTIALS;
  return { enabled: s.enabled, credentials, adc };
}

/** ¿Está la IA lista para usarse? (para mostrar estado en el panel) */
export async function isAiReady(): Promise<boolean> {
  const { enabled, credentials, adc } = await resolveCredentials();
  return enabled && (!!credentials || adc);
}

const LIKELY = new Set(["LIKELY", "VERY_LIKELY"]);

export async function analyzeImage(buffer: Buffer): Promise<AiResult> {
  const { enabled, credentials, adc } = await resolveCredentials();
  if (!enabled || (!credentials && !adc)) {
    return { verdict: "PENDING", scores: null, skipped: true };
  }
  try {
    const { ImageAnnotatorClient } = await import("@google-cloud/vision");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client: any = credentials
      ? new ImageAnnotatorClient({ credentials: JSON.parse(credentials) })
      : new ImageAnnotatorClient();

    const [res] = await client.annotateImage({
      image: { content: buffer },
      features: [{ type: "SAFE_SEARCH_DETECTION" }, { type: "FACE_DETECTION" }],
    });

    const safe = res.safeSearchAnnotation ?? {};
    const faces = res.faceAnnotations ?? [];
    const scores = {
      adult: safe.adult,
      violence: safe.violence,
      racy: safe.racy,
      medical: safe.medical,
      spoof: safe.spoof,
      faceCount: faces.length,
    };

    let verdict: AiVerdict = "CLEAN";
    if (LIKELY.has(safe.adult) || LIKELY.has(safe.racy)) verdict = "NSFW";
    else if (LIKELY.has(safe.violence)) verdict = "VIOLENCE";

    return { verdict, scores, skipped: false };
  } catch (err) {
    console.error("[ai-moderation] Vision falló", err);
    return { verdict: "ERROR", scores: null, skipped: true };
  }
}
