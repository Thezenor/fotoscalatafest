"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/server/auth/guards";
import { setTerms } from "@/server/services/settings.service";

export type TermsState = { ok?: boolean; error?: string };

export async function updateTermsAction(_prev: TermsState, formData: FormData): Promise<TermsState> {
  const actor = await requireRole("SUPERADMIN");
  const content = String(formData.get("content") ?? "").trim();
  const version = String(formData.get("version") ?? "").trim();
  if (!content || !version) return { error: "El contenido y la versión son obligatorios." };

  await setTerms({ version, content }, actor.id);
  revalidatePath("/", "layout"); // afecta a todas las páginas legales por locale
  return { ok: true };
}
