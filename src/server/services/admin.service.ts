import bcrypt from "bcryptjs";
import { prisma } from "@/server/db";
import { logAudit } from "@/server/services/audit.service";
import { deleteObject, publicUrl } from "@/server/services/storage.service";
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
    downloadMode?: string;
  },
  actorId?: string | null,
) {
  await prisma.event.update({ where: { id }, data });
  await logAudit({ action: "EVENT_CONFIG_UPDATED", entityType: "Event", entityId: id, userId: actorId ?? null, metadata: data });
}

// ─────────── Escenarios (stages) ───────────

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "escenario";
}

/** Escenarios de un evento con nº de fotos aprobadas y la foto-banner actual. */
export async function listEventStages(eventId: string) {
  const stages = await prisma.stage.findMany({
    where: { eventId },
    orderBy: { order: "asc" },
    include: { _count: { select: { photos: true } } },
  });
  return stages;
}

/** Fotos aprobadas de un escenario (para elegir la que se muestra en público). */
export async function listStagePhotoOptions(stageId: string) {
  const photos = await prisma.photo.findMany({
    where: { stageId, status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    take: 60,
    select: { id: true, printCode: true, thumbnailKey: true, watermarkedKey: true, originalKey: true, authorName: true, authorInstagram: true },
  });
  return photos.map((p) => {
    const demo = p.originalKey.startsWith("/") ? publicUrl(p.originalKey) : null;
    return {
      id: p.id,
      printCode: p.printCode,
      url: publicUrl(p.thumbnailKey) ?? publicUrl(p.watermarkedKey) ?? demo ?? "",
      author: p.authorName ?? p.authorInstagram ?? null,
    };
  });
}

export async function createStage(
  eventId: string,
  input: { name: string; sub?: string | null; dayLabel?: string | null },
  actorId?: string | null,
) {
  const count = await prisma.stage.count({ where: { eventId } });
  let slug = slugify(input.name);
  // garantizar unicidad (eventId, slug)
  const existing = await prisma.stage.findFirst({ where: { eventId, slug } });
  if (existing) slug = `${slug}-${count + 1}`;
  const stage = await prisma.stage.create({
    data: {
      eventId,
      name: input.name.trim(),
      slug,
      sub: input.sub?.trim() || null,
      dayLabel: input.dayLabel?.trim() || null,
      order: count,
    },
  });
  await logAudit({ action: "STAGE_CREATED", entityType: "Stage", entityId: stage.id, userId: actorId ?? null, metadata: { eventId, name: stage.name } });
  return stage;
}

export async function updateStage(
  id: string,
  data: { name?: string; sub?: string | null; dayLabel?: string | null; order?: number; bannerUrl?: string | null },
  actorId?: string | null,
) {
  await prisma.stage.update({ where: { id }, data });
  await logAudit({ action: "STAGE_UPDATED", entityType: "Stage", entityId: id, userId: actorId ?? null, metadata: data });
}

export async function deleteStage(id: string, actorId?: string | null) {
  // Las fotos quedan con stageId = null (onDelete: SetNull en el esquema).
  await prisma.stage.delete({ where: { id } });
  await logAudit({ action: "STAGE_DELETED", entityType: "Stage", entityId: id, userId: actorId ?? null });
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

// ─────────── Ingresos (negocio) ───────────

/** Métricas de ingresos a partir de los pedidos pagados/entregados. */
export async function getRevenueStats() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const PAID = { status: { in: ["PAID", "FULFILLED"] as ("PAID" | "FULFILLED")[] } };

  const [agg, todayAgg, byKind, byProvider, pendingCount, recent] = await Promise.all([
    prisma.printOrder.aggregate({ where: PAID, _sum: { amountCents: true }, _count: true }),
    prisma.printOrder.aggregate({
      where: { ...PAID, paidAt: { gte: startOfDay } },
      _sum: { amountCents: true },
      _count: true,
    }),
    prisma.printOrder.groupBy({ by: ["kind"], where: PAID, _sum: { amountCents: true }, _count: true }),
    prisma.printOrder.groupBy({ by: ["provider"], where: PAID, _sum: { amountCents: true }, _count: true }),
    prisma.printOrder.count({ where: { status: "PENDING" } }),
    prisma.printOrder.findMany({
      where: PAID,
      orderBy: { paidAt: "desc" },
      take: 25,
      include: { photo: { select: { printCode: true } } },
    }),
  ]);

  const totalCents = agg._sum.amountCents ?? 0;
  const count = agg._count ?? 0;
  return {
    totalCents,
    count,
    avgCents: count ? Math.round(totalCents / count) : 0,
    todayCents: todayAgg._sum.amountCents ?? 0,
    todayCount: todayAgg._count ?? 0,
    pendingCount,
    byKind: byKind.map((k) => ({ kind: k.kind, cents: k._sum.amountCents ?? 0, count: k._count })),
    byProvider: byProvider.map((p) => ({ provider: p.provider ?? "—", cents: p._sum.amountCents ?? 0, count: p._count })),
    recent: recent.map((o) => ({
      id: o.id,
      kind: o.kind,
      status: o.status,
      provider: o.provider ?? "—",
      amountCents: o.amountCents,
      currency: o.currency,
      printCode: o.photo?.printCode ?? null,
      paidAt: o.paidAt ? o.paidAt.toISOString() : null,
    })),
  };
}

// ─────────── Datos de exportación ───────────

export async function getExportData(eventId: string) {
  return prisma.photo.findMany({
    where: { eventId, status: "APPROVED" },
    include: { stage: true, consent: true },
    orderBy: { createdAt: "asc" },
  });
}
