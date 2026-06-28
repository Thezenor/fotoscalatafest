import type { AiVerdict } from "@prisma/client";

/**
 * Moderación automática con Google Cloud Vision (SafeSearch + Face Detection).
 * Ver AI_MODERATION.md. Degrada con elegancia: si no hay credenciales, NO analiza
 * y la foto se queda PENDING (revisión manual), que es el comportamiento seguro.
 *
 * Credenciales (Railway-friendly): define GOOGLE_VISION_CREDENTIALS con el JSON del
 * service account (string), o GOOGLE_APPLICATION_CREDENTIALS con la ruta al fichero.
 */

export interface AiResult {
  verdict: AiVerdict;
  scores: Record<string, unknown> | null;
  skipped: boolean; // true si no se analizó (sin credenciales o error)
}

export function isAiConfigured(): boolean {
  return (
    !!process.env.GOOGLE_VISION_CREDENTIALS ||
    !!process.env.GOOGLE_APPLICATION_CREDENTIALS
  );
}

// Cliente perezoso (la lib de Vision usa gRPC nativo; solo se carga si hay credenciales).
let clientPromise: Promise<unknown> | null = null;
async function getClient() {
  if (!clientPromise) {
    clientPromise = (async () => {
      const { ImageAnnotatorClient } = await import("@google-cloud/vision");
      const raw = process.env.GOOGLE_VISION_CREDENTIALS;
      if (raw) {
        const credentials = JSON.parse(raw);
        return new ImageAnnotatorClient({ credentials });
      }
      // Usa GOOGLE_APPLICATION_CREDENTIALS (ADC) por defecto.
      return new ImageAnnotatorClient();
    })();
  }
  return clientPromise;
}

const LIKELY = new Set(["LIKELY", "VERY_LIKELY"]);

/** Analiza una imagen. Devuelve un verdict y los scores por categoría. */
export async function analyzeImage(buffer: Buffer): Promise<AiResult> {
  if (!isAiConfigured()) {
    return { verdict: "PENDING", scores: null, skipped: true };
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = (await getClient()) as any;
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
    // Nota: SafeSearch/Face no estiman edad de forma fiable → la detección de
    // menores se delega al consentimiento + moderación humana (ver AI_MODERATION.md).

    return { verdict, scores, skipped: false };
  } catch (err) {
    console.error("[ai-moderation] Vision falló", err);
    return { verdict: "ERROR", scores: null, skipped: true };
  }
}
