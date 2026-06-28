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
} from "@/server/services/admin.service";
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
  },
) {
  const actor = await requireRole("SUPERADMIN");
  await updateEventConfig(id, data, actor.id);
  revalidatePath("/superadmin/eventos");
}
