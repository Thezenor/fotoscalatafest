import { prisma } from "@/server/db";
import type { Prisma } from "@prisma/client";

export interface AuditInput {
  action: string; // p.ej. "PHOTO_APPROVED", "LOGIN", "EVENT_EXPORT"
  entityType: string; // "Photo", "Event", "User", "Consent"…
  entityId?: string | null;
  userId?: string | null;
  metadata?: Prisma.InputJsonValue;
  ip?: string | null;
}

/**
 * Registra una acción en la bitácora inmutable. Nunca debe tumbar la operación
 * principal: si el log falla, se traza por consola pero no se propaga el error.
 */
export async function logAudit(input: AuditInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId ?? null,
        userId: input.userId ?? null,
        metadata: input.metadata,
        ip: input.ip ?? null,
      },
    });
  } catch (err) {
    console.error("[audit] no se pudo registrar la acción", input.action, err);
  }
}
