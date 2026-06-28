"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/server/auth/guards";
import { getBranding, setBranding } from "@/server/services/settings.service";
import { saveObject } from "@/server/services/storage.service";

const ALLOWED = ["image/png", "image/svg+xml", "image/webp", "image/jpeg"];

export type BrandingState = { ok?: boolean; error?: string };

export async function updateBrandingAction(
  _prev: BrandingState,
  formData: FormData,
): Promise<BrandingState> {
  const actor = await requireRole("SUPERADMIN");
  const current = await getBranding();

  let logoKey = current.logoKey;
  const file = formData.get("logo");
  if (file instanceof File && file.size > 0) {
    if (!ALLOWED.includes(file.type)) return { error: "Formato de logo no válido (PNG/SVG/WebP/JPG)." };
    if (file.size > 4 * 1024 * 1024) return { error: "El logo no debe superar 4 MB." };
    const buf = Buffer.from(await file.arrayBuffer());
    logoKey = await saveObject(buf, file.type);
  }

  const sponsors = String(formData.get("sponsors") ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  const showWordmark = formData.get("showWordmark") === "on";

  await setBranding({ logoKey, showWordmark, sponsors }, actor.id);
  revalidatePath("/", "layout"); // refresca logo/patrocinadores en todo el sitio
  return { ok: true };
}

export async function resetBrandLogoAction() {
  const actor = await requireRole("SUPERADMIN");
  const current = await getBranding();
  await setBranding({ ...current, logoKey: null }, actor.id);
  revalidatePath("/", "layout");
}
