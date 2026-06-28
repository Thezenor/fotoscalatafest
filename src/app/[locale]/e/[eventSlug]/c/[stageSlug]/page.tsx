import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { getActiveEventBySlug } from "@/server/services/event.service";
import { getAccessToken } from "@/lib/access";
import { ConsentForm } from "./consent-form";

export const dynamic = "force-dynamic";

export default async function ConsentPage({
  params,
}: {
  params: Promise<{ locale: string; eventSlug: string; stageSlug: string }>;
}) {
  const { locale, eventSlug, stageSlug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("consent");
  const tEvent = await getTranslations("event");

  const event = await getActiveEventBySlug(eventSlug);
  if (!event) redirect(`/e/${eventSlug}`);

  // Sin acceso válido → vuelta a la landing (gate).
  const token = await getAccessToken(eventSlug);
  if (token !== event.accessQrToken) redirect(`/e/${eventSlug}`);

  const stage = event.stages.find((s) => s.slug === stageSlug);
  if (!stage) redirect(`/e/${eventSlug}`);

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-10">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-lg">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          {stage.name}
        </p>
        <h1 className="mt-1 text-2xl font-bold">{t("title")}</h1>

        <ConsentForm
          eventSlug={eventSlug}
          stageSlug={stageSlug}
          termsHref={`/${locale}/legal/terms`}
          labels={{
            rights: t("rights"),
            adult: t("adult"),
            termsLink: t("termsLink"),
            accept: t("accept"),
            required: t("required"),
            access: tEvent("accessDenied"),
            error: t("required"),
          }}
        />
      </div>
    </main>
  );
}
