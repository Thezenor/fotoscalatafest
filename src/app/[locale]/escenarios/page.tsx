import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/content/PageHeader";
import { StageCard } from "@/components/content/StageCard";
import { SiteNav } from "@/components/content/SiteNav";
import { SiteFooter } from "@/components/content/SiteFooter";
import { listStages } from "@/server/services/photo.service";

export const dynamic = "force-dynamic";

export default async function StagesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("selector");
  const tc = await getTranslations("common");
  const stages = await listStages();

  return (
    <main className="w-full flex-1 pb-10">
      <SiteNav />

      {/* Cabecera móvil */}
      <div className="lg:hidden">
        <PageHeader backHref="/" title={t("title")} subtitle={t("subtitle")} />
      </div>

      <div className="mx-auto max-w-5xl px-5 lg:px-8">
        {/* Cabecera escritorio */}
        <div className="mb-6 hidden flex-col gap-1 pt-10 lg:flex">
          <h1 className="font-display text-4xl font-bold uppercase text-white">{t("title")}</h1>
          <p className="font-body text-base text-mist">{t("subtitle")}</p>
        </div>

        <div className="flex flex-col gap-3.5 lg:grid lg:grid-cols-2 lg:gap-5">
          {stages.map((s) => (
            <StageCard
              key={s.id}
              image={s.bannerUrl ?? "/demo/p01.png"}
              name={s.name}
              sub={s.sub ?? ""}
              day={s.dayLabel ?? ""}
              href={`/subir/${s.slug}`}
              cta={t("cta")}
            />
          ))}
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
