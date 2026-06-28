import { redirect } from "next/navigation";
import { auth } from "@/auth";
import type { Role } from "@prisma/client";

/** Devuelve la sesión actual o null. */
export async function getSession() {
  return auth();
}

/**
 * Exige sesión de staff. Redirige al login si no la hay.
 * Uso en Server Components / Server Actions del backoffice.
 */
export async function requireUser() {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }
  return session.user;
}

/** Jerarquía de roles: SUPERADMIN cubre todo. */
const RANK: Record<Role, number> = {
  MODERATOR: 1,
  ADMIN: 2,
  SUPERADMIN: 3,
};

/**
 * Exige que el usuario tenga al menos el rol indicado.
 * Lanza redirección si no cumple.
 */
export async function requireRole(min: Role) {
  const user = await requireUser();
  if (RANK[user.role] < RANK[min]) {
    redirect("/admin");
  }
  return user;
}

export function hasRole(role: Role | undefined, min: Role): boolean {
  if (!role) return false;
  return RANK[role] >= RANK[min];
}
