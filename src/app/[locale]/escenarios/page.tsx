import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/content/PageHeader";
import { StageCard } from "@/components/content/StageCard";
import { getStages } from "@/lib/mock-data";

export default async function StagesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("selector");
  const stages = getStages();

  return (
    <main className="mx-auto w-full max-w-[480px] flex-1 pb-8">
      <PageHeader backHref="/" title={t("title")} subtitle={t("subtitle")} />
      <div className="flex flex-col gap-3.5 px-5">
        {stages.map((s) => (
          <StageCard
            key={s.id}
            image={s.image}
            name={s.name}
            sub={s.sub}
            day={s.day}
            href={`/subir/${s.id}`}
            cta={t("cta")}
          />
        ))}
      </div>
    </main>
  );
}
