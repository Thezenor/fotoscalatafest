"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/server/auth/guards";
import { getAiSettings, setAiSettings } from "@/server/services/settings.service";

export type AiState = { ok?: boolean; error?: string };

export async function updateAiAction(_prev: AiState, formData: FormData): Promise<AiState> {
  const actor = await requireRole("SUPERADMIN");
  const current = await getAiSettings();

  const enabled = formData.get("enabled") === "on";
  const raw = String(formData.get("credentials") ?? "").trim();
  const clear = formData.get("clear") === "on";

  let googleCredentials = current.googleCredentials;
  if (clear) {
    googleCredentials = null;
  } else if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (!parsed.client_email || !parsed.private_key) {
        return { error: "El JSON no parece un service account (faltan client_email/private_key)." };
      }
      googleCredentials = raw;
    } catch {
      return { error: "El JSON de credenciales no es válido." };
    }
  }

  await setAiSettings({ enabled, googleCredentials }, actor.id);
  revalidatePath("/superadmin/ia");
  return { ok: true };
}
