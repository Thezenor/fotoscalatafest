import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="flex flex-col items-center gap-3">
        <span className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
          Calatafest
        </span>
        <h1 className="text-4xl font-black tracking-tight sm:text-6xl">
          {t("title")}
        </h1>
        <p className="max-w-md text-balance text-muted-foreground">
          {t("subtitle")}
        </p>
      </div>
      <p className="rounded-full border border-border px-4 py-2 text-sm text-muted-foreground">
        {t("scanPrompt")}
      </p>
    </main>
  );
}
