import { prisma } from "@/server/db";
import { logAudit } from "@/server/services/audit.service";
import { TERMS_VERSION, DEFAULT_TERMS } from "@/lib/legal";

/**
 * Ajustes configurables desde el superadmin (clave-valor en DB):
 * marca (logo/patrocinadores), IA (credenciales) y términos legales.
 * Caché en memoria de 30s para no golpear la DB en cada render del logo.
 */

export interface Branding {
  logoKey: string | null; // key del logo subido en el storage; null = mascota por defecto
  showWordmark: boolean; // mostrar el texto "CALATAFEST" junto al logo
  sponsors: string[]; // nombres de patrocinadores
}

export interface AiSettings {
  enabled: boolean;
  googleCredentials: string | null; // JSON del service account (string)
}

export interface Terms {
  version: string;
  content: string;
}

const DEFAULT_BRANDING: Branding = {
  logoKey: null,
  showWordmark: true,
  sponsors: ["Heraldo", "Coca-Cola", "Beefeater", "Ibercaja", "Ámbar", "Bono Cultural"],
};

const DEFAULT_AI: AiSettings = { enabled: true, googleCredentials: null };

const cache = new Map<string, { value: unknown; exp: number }>();
const TTL_MS = 30_000;

async function getSetting<T>(key: string, fallback: T): Promise<T> {
  const hit = cache.get(key);
  if (hit && hit.exp > Date.now()) return hit.value as T;
  try {
    const row = await prisma.setting.findUnique({ where: { key } });
    const value = (row?.value as T) ?? fallback;
    cache.set(key, { value, exp: Date.now() + TTL_MS });
    return value;
  } catch {
    return fallback;
  }
}

async function setSetting(key: string, value: unknown, actorId?: string | null) {
  await prisma.setting.upsert({
    where: { key },
    update: { value: value as object },
    create: { key, value: value as object },
  });
  cache.delete(key);
  await logAudit({ action: "SETTING_UPDATED", entityType: "Setting", entityId: key, userId: actorId ?? null });
}

// ── Marca ──
export const getBranding = () => getSetting<Branding>("branding", DEFAULT_BRANDING);
export const setBranding = (v: Branding, actorId?: string | null) => setSetting("branding", v, actorId);

// ── IA ──
export const getAiSettings = () => getSetting<AiSettings>("ai", DEFAULT_AI);
export const setAiSettings = (v: AiSettings, actorId?: string | null) => setSetting("ai", v, actorId);

// ── Términos ──
export const getTerms = () =>
  getSetting<Terms>("legal.terms", { version: TERMS_VERSION, content: DEFAULT_TERMS });
export const setTerms = (v: Terms, actorId?: string | null) => setSetting("legal.terms", v, actorId);
