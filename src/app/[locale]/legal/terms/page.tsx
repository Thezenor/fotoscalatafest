import { getTranslations, setRequestLocale } from "next-intl/server";
import { TERMS_VERSION } from "@/lib/legal";

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("legal");

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-6 py-10">
      <h1 className="text-2xl font-bold">{t("termsTitle")}</h1>
      <p className="text-xs text-muted-foreground">v{TERMS_VERSION}</p>
      <p className="text-sm text-muted-foreground">
        {/* Texto legal definitivo pendiente de redacción (ver LEGAL_RGPD.md). */}
        Documento de términos y condiciones. El texto legal definitivo será
        proporcionado por la organización del festival.
      </p>
    </main>
  );
}
