import { prisma } from "@/server/db";
import { logAudit } from "@/server/services/audit.service";
import { TERMS_VERSION } from "@/lib/legal";

export interface CreateConsentInput {
  eventId: string;
  acceptedRights: boolean;
  confirmedAdult: boolean;
  ip?: string | null;
  userAgent?: string | null;
}

/**
 * Registra el consentimiento legal. Exige que AMBAS condiciones sean true
 * (cesión de derechos + mayoría de edad/no menores). Validado en backend.
 */
export async function createConsent(input: CreateConsentInput) {
  if (!input.acceptedRights || !input.confirmedAdult) {
    throw new Error("CONSENT_INCOMPLETE");
  }

  const consent = await prisma.consent.create({
    data: {
      eventId: input.eventId,
      termsVersion: TERMS_VERSION,
      acceptedRights: input.acceptedRights,
      confirmedAdult: input.confirmedAdult,
      ip: input.ip ?? null,
      userAgent: input.userAgent ?? null,
    },
  });

  await logAudit({
    action: "CONSENT_ACCEPTED",
    entityType: "Consent",
    entityId: consent.id,
    metadata: { eventId: input.eventId, termsVersion: TERMS_VERSION },
    ip: input.ip ?? null,
  });

  return consent;
}

/** Verifica que un consentId pertenece al evento (cookie válida). */
export async function isValidConsent(consentId: string | null, eventId: string) {
  if (!consentId) return false;
  const consent = await prisma.consent.findFirst({
    where: { id: consentId, eventId },
    select: { id: true },
  });
  return !!consent;
}
