import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/content/PageHeader";
import { StageCard } from "@/components/content/StageCard";
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
  const stages = await listStages();

  return (
    <main className="mx-auto w-full max-w-[480px] flex-1 pb-8">
      <PageHeader backHref="/" title={t("title")} subtitle={t("subtitle")} />
      <div className="flex flex-col gap-3.5 px-5">
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
    </main>
  );
}
