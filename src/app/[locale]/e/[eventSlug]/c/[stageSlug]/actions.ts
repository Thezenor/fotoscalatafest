"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getActiveEventBySlug, isValidAccessToken } from "@/server/services/event.service";
import { createConsent } from "@/server/services/consent.service";
import { getAccessToken, setConsentCookie } from "@/lib/access";

export type ConsentState = { error?: "required" | "access" | "error" };

export async function acceptConsentAction(
  _prev: ConsentState,
  formData: FormData,
): Promise<ConsentState> {
  const eventSlug = String(formData.get("eventSlug") ?? "");
  const stageSlug = String(formData.get("stageSlug") ?? "");
  const acceptedRights = formData.get("acceptedRights") === "on";
  const confirmedAdult = formData.get("confirmedAdult") === "on";

  // Re-valida el acceso en el backend (no confiar en el cliente).
  const token = await getAccessToken(eventSlug);
  if (!(await isValidAccessToken(eventSlug, token))) {
    return { error: "access" };
  }

  // Ambas condiciones son obligatorias.
  if (!acceptedRights || !confirmedAdult) {
    return { error: "required" };
  }

  const event = await getActiveEventBySlug(eventSlug);
  if (!event) return { error: "access" };

  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? null;
  const userAgent = h.get("user-agent");

  try {
    const consent = await createConsent({
      eventId: event.id,
      acceptedRights,
      confirmedAdult,
      ip,
      userAgent,
    });
    await setConsentCookie(event.id, consent.id);
  } catch {
    return { error: "error" };
  }

  redirect(`/e/${eventSlug}/upload?stage=${stageSlug}`);
}
