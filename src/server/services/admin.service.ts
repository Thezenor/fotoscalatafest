import bcrypt from "bcryptjs";
import { prisma } from "@/server/db";
import { logAudit } from "@/server/services/audit.service";
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
  },
  actorId?: string | null,
) {
  await prisma.event.update({ where: { id }, data });
  await logAudit({ action: "EVENT_CONFIG_UPDATED", entityType: "Event", entityId: id, userId: actorId ?? null, metadata: data });
}

// ─────────── Datos de exportación ───────────

export async function getExportData(eventId: string) {
  return prisma.photo.findMany({
    where: { eventId, status: "APPROVED" },
    include: { stage: true, consent: true },
    orderBy: { createdAt: "asc" },
  });
}
