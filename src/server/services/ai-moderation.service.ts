import type { AiVerdict } from "@prisma/client";
import { getAiSettings } from "@/server/services/settings.service";

/**
 * Moderación automática multiproveedor. Hoy implementado: Google Cloud Vision.
 * Preparado (estructura lista, falta integración) para AWS Rekognition, OpenAI
 * Vision y Sightengine. El proveedor y las claves se eligen en /superadmin/ia.
 * Degrada con elegancia: si no hay clave/proveedor o está desactivada, NO analiza
 * y la foto queda PENDING (revisión manual). Ver AI_MODERATION.md.
 */

export interface AiResult {
  verdict: AiVerdict;
  scores: Record<string, unknown> | null;
  skipped: boolean;
}

export interface AiProvider {
  id: string;
  label: string;
  implemented: boolean;
  keyLabel: string; // qué pegar en el campo de credenciales
  analyze?: (buffer: Buffer, key: string | null) => Promise<AiResult>;
}

const LIKELY = new Set(["LIKELY", "VERY_LIKELY"]);

async function googleVision(buffer: Buffer, key: string | null): Promise<AiResult> {
  // key = JSON del service account; si no, usa GOOGLE_APPLICATION_CREDENTIALS (ADC).
  const cred = key || process.env.GOOGLE_VISION_CREDENTIALS || null;
  if (!cred && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return { verdict: "PENDING", scores: null, skipped: true };
  }
  try {
    const { ImageAnnotatorClient } = await import("@google-cloud/vision");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client: any = cred
      ? new ImageAnnotatorClient({ credentials: JSON.parse(cred) })
      : new ImageAnnotatorClient();
    const [res] = await client.annotateImage({
      image: { content: buffer },
      features: [{ type: "SAFE_SEARCH_DETECTION" }, { type: "FACE_DETECTION" }],
    });
    const safe = res.safeSearchAnnotation ?? {};
    const faces = res.faceAnnotations ?? [];
    const scores = { adult: safe.adult, violence: safe.violence, racy: safe.racy, medical: safe.medical, spoof: safe.spoof, faceCount: faces.length };
    let verdict: AiVerdict = "CLEAN";
    if (LIKELY.has(safe.adult) || LIKELY.has(safe.racy)) verdict = "NSFW";
    else if (LIKELY.has(safe.violence)) verdict = "VIOLENCE";
    return { verdict, scores, skipped: false };
  } catch (err) {
    console.error("[ai] Google Vision falló", err);
    return { verdict: "ERROR", scores: null, skipped: true };
  }
}

export const AI_PROVIDERS: AiProvider[] = [
  { id: "google-vision", label: "Google Cloud Vision (SafeSearch)", implemented: true, keyLabel: "JSON del service account", analyze: googleVision },
  { id: "aws-rekognition", label: "AWS Rekognition (preparado)", implemented: false, keyLabel: "AWS access key / secret (JSON)" },
  { id: "openai-vision", label: "OpenAI Vision (preparado)", implemented: false, keyLabel: "OpenAI API key" },
  { id: "sightengine", label: "Sightengine (preparado)", implemented: false, keyLabel: "API user + secret" },
];

export function getProvider(id: string): AiProvider | undefined {
  return AI_PROVIDERS.find((p) => p.id === id);
}

export async function isAiReady(): Promise<boolean> {
  const s = await getAiSettings();
  const provider = getProvider(s.provider);
  if (!s.enabled || !provider?.implemented) return false;
  const key = s.apiKeys[s.provider];
  return !!key || (s.provider === "google-vision" && !!process.env.GOOGLE_APPLICATION_CREDENTIALS);
}

export async function analyzeImage(buffer: Buffer): Promise<AiResult> {
  const s = await getAiSettings();
  if (!s.enabled) return { verdict: "PENDING", scores: null, skipped: true };
  const provider = getProvider(s.provider);
  if (!provider?.implemented || !provider.analyze) {
    // Proveedor preparado pero no integrado → moderación manual.
    return { verdict: "PENDING", scores: null, skipped: true };
  }
  return provider.analyze(buffer, s.apiKeys[s.provider] ?? null);
}
