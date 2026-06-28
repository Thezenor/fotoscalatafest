import { cookies } from "next/headers";

/**
 * Cookies de acceso público (httpOnly). No contienen datos personales:
 * - acceso al evento: guarda el token del QR para validarlo contra la DB.
 * - consentimiento: guarda el id del Consent aceptado para ese evento.
 */
export const accessCookieName = (eventSlug: string) => `cf_acc_${eventSlug}`;
export const consentCookieName = (eventId: string) => `cf_con_${eventId}`;

const COOKIE_BASE = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  secure: process.env.NODE_ENV === "production",
};

export async function setAccessCookie(eventSlug: string, token: string) {
  const store = await cookies();
  store.set(accessCookieName(eventSlug), token, {
    ...COOKIE_BASE,
    maxAge: 60 * 60 * 12, // 12h, duración típica de jornada de festival
  });
}

export async function getAccessToken(eventSlug: string): Promise<string | null> {
  const store = await cookies();
  return store.get(accessCookieName(eventSlug))?.value ?? null;
}

export async function setConsentCookie(eventId: string, consentId: string) {
  const store = await cookies();
  store.set(consentCookieName(eventId), consentId, {
    ...COOKIE_BASE,
    maxAge: 60 * 60 * 12,
  });
}

export async function getConsentId(eventId: string): Promise<string | null> {
  const store = await cookies();
  return store.get(consentCookieName(eventId))?.value ?? null;
}
