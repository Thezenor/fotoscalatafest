"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/server/auth/guards";
import {
  getPayments,
  setPayments,
  getPrintConfig,
  setPrintConfig,
  getTemplates,
  setTemplates,
  type LogoPosition,
  type TemplateConfig,
} from "@/server/services/settings.service";

export type StoreState = { ok?: boolean; error?: string };

const num = (v: FormDataEntryValue | null, def = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
};
const eurToCents = (v: FormDataEntryValue | null) => Math.round(num(v) * 100);

export async function updatePaymentsAction(_prev: StoreState, formData: FormData): Promise<StoreState> {
  const actor = await requireRole("SUPERADMIN");
  const cur = await getPayments();
  // Las claves vacías mantienen las actuales (no se borran al guardar).
  const keep = (field: string, current: string | null) => {
    const v = String(formData.get(field) ?? "").trim();
    return v || current;
  };

  await setPayments(
    {
      currency: String(formData.get("currency") ?? "EUR").toUpperCase().slice(0, 3) || "EUR",
      stripeEnabled: formData.get("stripeEnabled") === "on",
      stripeSecretKey: keep("stripeSecretKey", cur.stripeSecretKey),
      stripePublishableKey: keep("stripePublishableKey", cur.stripePublishableKey),
      paypalEnabled: formData.get("paypalEnabled") === "on",
      paypalClientId: keep("paypalClientId", cur.paypalClientId),
      paypalSecret: keep("paypalSecret", cur.paypalSecret),
      paypalMode: formData.get("paypalMode") === "live" ? "live" : "sandbox",
    },
    actor.id,
  );

  await setPrintConfig(
    {
      downloadEnabled: formData.get("downloadEnabled") === "on",
      downloadPriceCents: eurToCents(formData.get("downloadPrice")),
      printEnabled: formData.get("printEnabled") === "on",
      printPriceCents: eurToCents(formData.get("printPrice")),
    },
    actor.id,
  );

  revalidatePath("/superadmin/pagos");
  return { ok: true };
}

function readTpl(formData: FormData, prefix: string): TemplateConfig {
  return {
    showSponsorLogo: formData.get(`${prefix}_showSponsorLogo`) === "on",
    logoPosition: (String(formData.get(`${prefix}_logoPosition`) ?? "bottom-right") as LogoPosition),
    logoScalePct: Math.min(60, Math.max(5, num(formData.get(`${prefix}_logoScalePct`), 22))),
    frameColor: (String(formData.get(`${prefix}_frameColor`) ?? "").trim() || null),
    framePx: Math.min(120, Math.max(0, num(formData.get(`${prefix}_framePx`), 0))),
  };
}

export async function updateTemplatesAction(_prev: StoreState, formData: FormData): Promise<StoreState> {
  const actor = await requireRole("SUPERADMIN");
  await getTemplates(); // asegura defaults
  await setTemplates(
    { vertical: readTpl(formData, "v"), horizontal: readTpl(formData, "h") },
    actor.id,
  );
  revalidatePath("/superadmin/plantillas");
  return { ok: true };
}
