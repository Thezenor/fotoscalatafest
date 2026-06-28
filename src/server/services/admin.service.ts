import bcrypt from "bcryptjs";
import { prisma } from "@/server/db";
import { logAudit } from "@/server/services/audit.service";
import { deleteObject } from "@/server/services/storage.service";
import type { Role } from "@prisma/client";

// ─────────── Usuarios y roles ───────────

export async function listUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true },
  });
}

export async function createStaffUser(input: {
  email: string;
  name?: string | null;
  role: Role;
  password: string;
  actorId?: string | null;
}) {
  const email = input.email.toLowerCase().trim();
  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await prisma.user.create({
    data: { email, name: input.name ?? null, role: input.role, passwordHash },
    select: { id: true, email: true, role: true },
  });
  await logAudit({
    action: "USER_CREATED",
    entityType: "User",
    entityId: user.id,
    userId: input.actorId ?? null,
    metadata: { email, role: input.role },
  });
  return user;
}

export async function setUserRole(id: string, role: Role, actorId?: string | null) {
  await prisma.user.update({ where: { id }, data: { role } });
  await logAudit({ action: "USER_ROLE_CHANGED", entityType: "User", entityId: id, userId: actorId ?? null, metadata: { role } });
}

export async function setUserActive(id: string, isActive: boolean, actorId?: string | null) {
  await prisma.user.update({ where: { id }, data: { isActive } });
  await logAudit({ action: isActive ? "USER_ENABLED" : "USER_DISABLED", entityType: "User", entityId: id, userId: actorId ?? null });
}

// ─────────── Auditoría ───────────

export async function listAuditLogs(opts?: { action?: string; take?: number }) {
  return prisma.auditLog.findMany({
    where: opts?.action ? { action: opts.action } : undefined,
    orderBy: { createdAt: "desc" },
    take: opts?.take ?? 200,
    include: { user: { select: { email: true } } },
  });
}

export async function listAuditActions() {
  const rows = await prisma.auditLog.findMany({
    distinct: ["action"],
    select: { action: true },
    orderBy: { action: "asc" },
  });
  return rows.map((r) => r.action);
}

// ─────────── Eventos ───────────

export async function listEvents() {
  return prisma.event.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { photos: true, stages: true } } },
  });
}

export async function updateEventConfig(
  id: string,
  data: {
    isActive?: boolean;
    watermarkEnabled?: boolean;
    watermarkPosition?: string;
    watermarkOpacity?: number;
    autoApproveOnAiClean?: boolean;
    sponsors?: string[];
  },
  actorId?: string | null,
) {
  await prisma.event.update({ where: { id }, data });
  await logAudit({ action: "EVENT_CONFIG_UPDATED", entityType: "Event", entityId: id, userId: actorId ?? null, metadata: data });
}

// ─────────── Estadísticas de moderación ───────────

export async function getModerationStats(eventId: string) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const [pending, approved, uploadedToday, onScreen] = await Promise.all([
    prisma.photo.count({ where: { eventId, status: { in: ["PENDING", "AI_APPROVED", "AI_FLAGGED"] } } }),
    prisma.photo.count({ where: { eventId, status: "APPROVED" } }),
    prisma.photo.count({ where: { eventId, createdAt: { gte: startOfDay } } }),
    prisma.photo.count({ where: { eventId, status: "APPROVED", onScreen: true } }),
  ]);
  return { pending, approved, uploadedToday, onScreen };
}

// ─────────── Solicitudes de retirada (RGPD) ───────────

export async function listRemovalRequests() {
  return prisma.removalRequest.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: { photo: { select: { id: true, stage: { select: { name: true } } } } },
  });
}

export async function countOpenRemovals() {
  return prisma.removalRequest.count({ where: { status: "OPEN" } });
}

/**
 * Resuelve una solicitud de retirada. Si `takedown`, retira la foto asociada:
 * borra los ficheros del storage y la marca como REJECTED (deja de ser pública).
 */
export async function resolveRemoval(id: string, actorId?: string | null, takedown = true) {
  const req = await prisma.removalRequest.findUnique({
    where: { id },
    include: { photo: true },
  });

  if (takedown && req?.photo) {
    const p = req.photo;
    await Promise.all([
      deleteObject(p.originalKey),
      deleteObject(p.thumbnailKey),
      deleteObject(p.watermarkedKey),
    ]);
    await prisma.photo.update({
      where: { id: p.id },
      data: { status: "REJECTED", onScreen: false, featured: false, rejectReason: "Retirada (RGPD)" },
    });
    await logAudit({ action: "PHOTO_TAKEN_DOWN", entityType: "Photo", entityId: p.id, userId: actorId ?? null, metadata: { removalId: id } });
  }

  await prisma.removalRequest.update({
    where: { id },
    data: { status: "RESOLVED", resolvedAt: new Date() },
  });
  await logAudit({ action: "REMOVAL_RESOLVED", entityType: "RemovalRequest", entityId: id, userId: actorId ?? null });
}

// ─────────── Impresión en sitio ───────────

/** Cola de copias pagadas pendientes de imprimir (FIFO). */
export async function listPrintQueue() {
  return prisma.printOrder.findMany({
    where: { kind: "print", status: "PAID" },
    orderBy: { paidAt: "asc" },
    include: { photo: { select: { id: true, printCode: true, stage: { select: { name: true } }, day: true, timeLabel: true } } },
  });
}

/** Copias ya impresas (historial reciente). */
export async function listPrintFulfilled(take = 30) {
  return prisma.printOrder.findMany({
    where: { kind: "print", status: "FULFILLED" },
    orderBy: { paidAt: "desc" },
    take,
    include: { photo: { select: { id: true, printCode: true, stage: { select: { name: true } } } } },
  });
}

export async function countPrintQueue() {
  return prisma.printOrder.count({ where: { kind: "print", status: "PAID" } });
}

/** Busca un pedido de impresión PAGADO por el código de la foto. */
export async function findPrintByCode(code: string) {
  const photo = await prisma.photo.findUnique({
    where: { printCode: code.trim().toUpperCase() },
    select: { id: true, printCode: true, stage: { select: { name: true } } },
  });
  if (!photo) return null;
  const order = await prisma.printOrder.findFirst({
    where: { photoId: photo.id, kind: "print", status: { in: ["PAID", "FULFILLED"] } },
    orderBy: { paidAt: "desc" },
  });
  return order ? { order, photo } : null;
}

export async function fulfillPrintOrder(id: string, actorId?: string | null) {
  await prisma.printOrder.update({ where: { id }, data: { status: "FULFILLED" } });
  await logAudit({ action: "PRINT_FULFILLED", entityType: "PrintOrder", entityId: id, userId: actorId ?? null });
}

// ─────────── Datos de exportación ───────────

export async function getExportData(eventId: string) {
  return prisma.photo.findMany({
    where: { eventId, status: "APPROVED" },
    include: { stage: true, consent: true },
    orderBy: { createdAt: "asc" },
  });
}
