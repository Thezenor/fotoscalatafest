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
  provider: string; // "google-vision" | "aws-rekognition" | "openai-vision" | "sightengine"
  apiKeys: Record<string, string>; // proveedor → clave/credenciales
}

export interface Terms {
  version: string;
  content: string;
}

export type LogoPosition = "bottom-right" | "bottom-left" | "top-right" | "top-left" | "center";

export interface TemplateConfig {
  showSponsorLogo: boolean;
  logoPosition: LogoPosition;
  logoScalePct: number; // % del ancho que ocupa el logo
  frameColor: string | null; // marco opcional (hex) o null
  framePx: number;
}

export interface Templates {
  vertical: TemplateConfig;
  horizontal: TemplateConfig;
}

export interface Payments {
  currency: string; // "EUR"
  stripeEnabled: boolean;
  stripeSecretKey: string | null;
  stripePublishableKey: string | null;
  stripeWebhookSecret: string | null;
  paypalEnabled: boolean;
  paypalClientId: string | null;
  paypalSecret: string | null;
  paypalMode: "sandbox" | "live";
}

export interface PrintConfig {
  downloadEnabled: boolean; // venta de descarga en alta calidad (tratada)
  downloadPriceCents: number;
  printEnabled: boolean; // impresión en sitio
  printPriceCents: number;
}

const DEFAULT_BRANDING: Branding = {
  logoKey: null,
  showWordmark: true,
  sponsors: ["Heraldo", "Coca-Cola", "Beefeater", "Ibercaja", "Ámbar", "Bono Cultural"],
};

const DEFAULT_AI: AiSettings = { enabled: true, provider: "google-vision", apiKeys: {} };

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
export async function getAiSettings(): Promise<AiSettings> {
  const raw = await getSetting<Record<string, unknown>>("ai", DEFAULT_AI as unknown as Record<string, unknown>);
  // Compatibilidad con el formato antiguo { enabled, googleCredentials }.
  if (raw && "googleCredentials" in raw && !("apiKeys" in raw)) {
    const apiKeys: Record<string, string> = {};
    if (raw.googleCredentials) apiKeys["google-vision"] = String(raw.googleCredentials);
    return { enabled: Boolean(raw.enabled), provider: "google-vision", apiKeys };
  }
  const v = raw as unknown as AiSettings;
  return {
    enabled: Boolean(v.enabled),
    provider: v.provider ?? "google-vision",
    apiKeys: v.apiKeys ?? {},
  };
}
export const setAiSettings = (v: AiSettings, actorId?: string | null) => setSetting("ai", v, actorId);

// ── Términos ──
export const getTerms = () =>
  getSetting<Terms>("legal.terms", { version: TERMS_VERSION, content: DEFAULT_TERMS });
export const setTerms = (v: Terms, actorId?: string | null) => setSetting("legal.terms", v, actorId);

// ── Plantillas (overlay sponsor para descarga/impresión) ──
const DEFAULT_TPL: TemplateConfig = {
  showSponsorLogo: true,
  logoPosition: "bottom-right",
  logoScalePct: 22,
  frameColor: null,
  framePx: 0,
};
export const getTemplates = () =>
  getSetting<Templates>("templates", { vertical: DEFAULT_TPL, horizontal: DEFAULT_TPL });
export const setTemplates = (v: Templates, actorId?: string | null) => setSetting("templates", v, actorId);

// ── Pagos ──
const DEFAULT_PAYMENTS: Payments = {
  currency: "EUR",
  stripeEnabled: false,
  stripeSecretKey: null,
  stripePublishableKey: null,
  stripeWebhookSecret: null,
  paypalEnabled: false,
  paypalClientId: null,
  paypalSecret: null,
  paypalMode: "sandbox",
};
export const getPayments = () => getSetting<Payments>("payments", DEFAULT_PAYMENTS);
export const setPayments = (v: Payments, actorId?: string | null) => setSetting("payments", v, actorId);

// ── Email transaccional (aviso de aprobación) ──
export interface EmailConfig {
  enabled: boolean;
  provider: string; // "resend"
  apiKey: string | null;
  fromEmail: string | null; // p.ej. "Calatafest Fotos <fotos@fotoscalatafest.com>"
}
const DEFAULT_EMAIL: EmailConfig = { enabled: false, provider: "resend", apiKey: null, fromEmail: null };
export const getEmailConfig = () => getSetting<EmailConfig>("email", DEFAULT_EMAIL);
export const setEmailConfig = (v: EmailConfig, actorId?: string | null) => setSetting("email", v, actorId);

// ── TV en directo (pantalla de proyección) ──
export interface TvConfig {
  template: string; // clave de plantilla: cinematic | neon | stack | mosaico | destacadas
  intervalMs: number; // cadencia de rotación
  showSponsors: boolean; // mostrar franja de patrocinadores
  showQr: boolean; // mostrar QR "sube tu foto"
}
const DEFAULT_TV: TvConfig = {
  template: "destacadas",
  intervalMs: 5000,
  showSponsors: true,
  showQr: true,
};
export const getTvConfig = () => getSetting<TvConfig>("tv", DEFAULT_TV);
export const setTvConfig = (v: TvConfig, actorId?: string | null) => setSetting("tv", v, actorId);

// ── Precios (tienda) ──
const DEFAULT_PRINT: PrintConfig = {
  downloadEnabled: false,
  downloadPriceCents: 300,
  printEnabled: false,
  printPriceCents: 500,
};
export const getPrintConfig = () => getSetting<PrintConfig>("print", DEFAULT_PRINT);
export const setPrintConfig = (v: PrintConfig, actorId?: string | null) => setSetting("print", v, actorId);
