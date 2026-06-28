import { getEmailConfig } from "@/server/services/settings.service";
import { siteUrl } from "@/lib/seo";
import { logAudit } from "@/server/services/audit.service";

/**
 * Aviso por email cuando una foto se aprueba. No-op si el email no está
 * configurado (sin proveedor/clave). Resiliente: nunca lanza, para no bloquear
 * la moderación. Usa la API HTTP de Resend (sin SDK).
 */
export async function sendApprovalEmail(opts: {
  to: string;
  photoId: string;
  locale?: string;
}): Promise<boolean> {
  try {
    const cfg = await getEmailConfig();
    if (!cfg.enabled || !cfg.apiKey || !cfg.fromEmail) return false;
    if (cfg.provider !== "resend") return false;

    const locale = opts.locale ?? "es";
    const url = `${siteUrl()}/${locale}/foto/${opts.photoId}`;
    const T = COPY[locale] ?? COPY.es;

    const html = `
      <div style="font-family:system-ui,Arial,sans-serif;background:#0e0e0e;color:#fff;padding:32px;border-radius:16px;max-width:520px;margin:auto">
        <h1 style="color:#f9b41a;font-size:24px;margin:0 0 12px">${T.title}</h1>
        <p style="color:#d8d8d8;font-size:15px;line-height:1.5;margin:0 0 24px">${T.body}</p>
        <a href="${url}" style="display:inline-block;background:#f9b41a;color:#0e0e0e;font-weight:700;text-decoration:none;padding:14px 24px;border-radius:999px">${T.cta}</a>
        <p style="color:#777;font-size:12px;margin:24px 0 0">Calatafest Fotos · fotoscalatafest.com</p>
      </div>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${cfg.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: cfg.fromEmail, to: opts.to, subject: T.subject, html }),
    });
    const ok = res.ok;
    await logAudit({
      action: ok ? "EMAIL_SENT" : "EMAIL_FAILED",
      entityType: "Photo",
      entityId: opts.photoId,
      metadata: { kind: "approval" },
    });
    return ok;
  } catch {
    return false;
  }
}

const COPY: Record<string, { subject: string; title: string; body: string; cta: string }> = {
  es: {
    subject: "¡Tu foto del Calatafest ya está publicada! 📸",
    title: "¡Tu foto ya está publicada!",
    body: "Tu foto ha pasado la moderación y ya aparece en la galería del festival. Échale un vistazo, compártela y consíguela en alta calidad.",
    cta: "Ver mi foto",
  },
  en: {
    subject: "Your Calatafest photo is now live! 📸",
    title: "Your photo is now live!",
    body: "Your photo passed moderation and is now in the festival gallery. Take a look, share it and get it in high quality.",
    cta: "View my photo",
  },
  ca: {
    subject: "La teva foto del Calatafest ja està publicada! 📸",
    title: "La teva foto ja està publicada!",
    body: "La teva foto ha passat la moderació i ja apareix a la galeria del festival. Fes-hi un cop d'ull, comparteix-la i aconsegueix-la en alta qualitat.",
    cta: "Veure la meva foto",
  },
};
