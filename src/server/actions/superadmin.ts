"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/server/auth/guards";
import {
  createStaffUser,
  setUserRole,
  setUserActive,
  updateEventConfig,
  resolveRemoval,
  createStage,
  updateStage,
  deleteStage,
} from "@/server/services/admin.service";
import { setTvConfig, setEmailConfig, type TvConfig, type EmailConfig } from "@/server/services/settings.service";
import type { Role } from "@prisma/client";

const ROLES = ["SUPERADMIN", "ADMIN", "MODERATOR"] as const;

const newUserSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  role: z.enum(ROLES),
  password: z.string().min(8),
});

export type NewUserState = { error?: string; ok?: boolean };

export async function createUserAction(
  _prev: NewUserState,
  formData: FormData,
): Promise<NewUserState> {
  const actor = await requireRole("SUPERADMIN");
  const parsed = newUserSchema.safeParse({
    email: formData.get("email"),
    name: formData.get("name") || undefined,
    role: formData.get("role"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: "Datos inválidos (email válido y contraseña ≥ 8)." };

  try {
    await createStaffUser({ ...parsed.data, actorId: actor.id });
  } catch {
    return { error: "No se pudo crear (¿email ya existe?)." };
  }
  revalidatePath("/superadmin/usuarios");
  return { ok: true };
}

export async function changeRoleAction(id: string, role: Role) {
  const actor = await requireRole("SUPERADMIN");
  await setUserRole(id, role, actor.id);
  revalidatePath("/superadmin/usuarios");
}

export async function toggleActiveAction(id: string, isActive: boolean) {
  const actor = await requireRole("SUPERADMIN");
  await setUserActive(id, isActive, actor.id);
  revalidatePath("/superadmin/usuarios");
}

export async function resolveRemovalAction(id: string) {
  const actor = await requireRole("SUPERADMIN");
  await resolveRemoval(id, actor.id);
  revalidatePath("/superadmin/retiradas");
}

export async function updateEventAction(
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
) {
  const actor = await requireRole("SUPERADMIN");
  await updateEventConfig(id, data, actor.id);
  revalidatePath("/superadmin/eventos");
}

// ── Escenarios ──

export async function createStageAction(
  eventId: string,
  input: { name: string; sub?: string; dayLabel?: string },
) {
  const actor = await requireRole("SUPERADMIN");
  if (!input.name?.trim()) return { error: "El nombre del escenario es obligatorio." };
  await createStage(eventId, input, actor.id);
  revalidatePath("/superadmin/eventos");
  return { ok: true };
}

export async function updateStageAction(
  id: string,
  data: { name?: string; sub?: string | null; dayLabel?: string | null; bannerUrl?: string | null },
) {
  const actor = await requireRole("SUPERADMIN");
  await updateStage(id, data, actor.id);
  revalidatePath("/superadmin/eventos");
  return { ok: true };
}

export async function deleteStageAction(id: string) {
  const actor = await requireRole("SUPERADMIN");
  await deleteStage(id, actor.id);
  revalidatePath("/superadmin/eventos");
  return { ok: true };
}

// ── TV en directo ──

export async function saveTvConfigAction(cfg: TvConfig) {
  const actor = await requireRole("SUPERADMIN");
  await setTvConfig(cfg, actor.id);
  revalidatePath("/superadmin/tv");
  revalidatePath("/live");
  return { ok: true };
}

// ── Email transaccional ──

export async function saveEmailConfigAction(cfg: EmailConfig) {
  const actor = await requireRole("SUPERADMIN");
  await setEmailConfig(
    {
      enabled: !!cfg.enabled,
      provider: cfg.provider || "resend",
      apiKey: cfg.apiKey?.trim() || null,
      fromEmail: cfg.fromEmail?.trim() || null,
    },
    actor.id,
  );
  revalidatePath("/superadmin/email");
  return { ok: true };
}
