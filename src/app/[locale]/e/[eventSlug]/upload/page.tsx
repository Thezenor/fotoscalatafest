import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { getActiveEventBySlug } from "@/server/services/event.service";
import { getAccessToken, getConsentId } from "@/lib/access";
import { isValidConsent } from "@/server/services/consent.service";

export const dynamic = "force-dynamic";

export default async function UploadPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; eventSlug: string }>;
  searchParams: Promise<{ stage?: string }>;
}) {
  const { locale, eventSlug } = await params;
  setRequestLocale(locale);
  const { stage } = await searchParams;
  const t = await getTranslations("upload");

  const event = await getActiveEventBySlug(eventSlug);
  if (!event) redirect(`/e/${eventSlug}`);

  // Requiere acceso válido y consentimiento registrado.
  const token = await getAccessToken(eventSlug);
  if (token !== event.accessQrToken) redirect(`/e/${eventSlug}`);

  const consentId = await getConsentId(event.id);
  if (!(await isValidConsent(consentId, event.id))) {
    redirect(`/e/${eventSlug}`);
  }

  const stageName = event.stages.find((s) => s.slug === stage)?.name ?? stage ?? "";

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-10 text-center">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      {stageName && (
        <p className="text-sm text-muted-foreground">
          {t("stage", { stage: stageName })}
        </p>
      )}
      <p className="rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground">
        {t("consentOk")}
      </p>
      <p className="text-xs text-muted-foreground">{t("comingSoon")}</p>
    </main>
  );
}
