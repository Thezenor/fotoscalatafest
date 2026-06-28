import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Camera } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/ui/Logo";
import { buttonClass } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Marquee } from "@/components/content/Marquee";
import { StageCard } from "@/components/content/StageCard";
import { SponsorStrip } from "@/components/content/SponsorStrip";
import { LangSwitcher } from "@/components/content/LangSwitcher";
import { SiteNav } from "@/components/content/SiteNav";
import { listStages } from "@/server/services/photo.service";

export const dynamic = "force-dynamic";

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("landing");
  const tc = await getTranslations("common");
  const stages = await listStages();

  return (
    <main className="w-full flex-1">
      <SiteNav floating labels={{ gallery: tc("viewGallery"), upload: tc("uploadPhoto") }} />

      {/* HERO */}
      <section className="relative min-h-[560px] overflow-hidden lg:min-h-[82vh]">
        <Image src="/demo/p10.png" alt="" fill priority sizes="100vw" className="object-cover" />
        <div className="overlay-vert absolute inset-0" />
        <div className="absolute inset-0 hidden bg-gradient-to-r from-ink/80 via-ink/20 to-transparent lg:block" />

        {/* Top bar móvil + marquee */}
        <div className="absolute inset-x-0 top-0 lg:hidden">
          <div className="flex items-center justify-between px-5 pb-3 pt-4">
            <Logo size={30} wordSize={18} />
            <LangSwitcher />
          </div>
          <Marquee text={t("marquee")} />
        </div>
        <div className="absolute inset-x-0 top-[68px] hidden lg:block">
          <Marquee text={t("marquee")} />
        </div>

        {/* Copy */}
        <div className="absolute inset-x-0 bottom-0">
          <div className="mx-auto max-w-7xl px-[22px] pb-8 lg:px-8 lg:pb-16">
            <div className="flex max-w-xl flex-col gap-3 lg:gap-5">
              <Eyebrow>{t("eyebrow")}</Eyebrow>
              <h1 className="font-display text-[46px] font-bold uppercase leading-[0.92] text-white lg:text-7xl">
                {t("title")}
              </h1>
              <p className="max-w-md font-body text-[15px] text-[#D8D8D8] lg:text-lg">
                {t("subtitle")}
              </p>
              <div className="mt-1 flex flex-col gap-3 sm:flex-row">
                <Link href="/escenarios" className={buttonClass({ className: "uppercase sm:px-9" })}>
                  <Camera className="h-5 w-5" /> {tc("uploadPhoto")}
                </Link>
                <Link
                  href="/galeria"
                  className={buttonClass({ variant: "secondary", size: "md", className: "uppercase" })}
                >
                  {tc("viewGallery")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ELIGE TU ESCENARIO */}
      <section className="mx-auto max-w-7xl px-[22px] py-8 lg:px-8 lg:py-14">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-[22px] font-bold uppercase text-white lg:text-3xl">
            {t("chooseStage")}
          </h2>
          <Link href="/escenarios" className="font-body text-[13px] text-brand lg:text-base">
            {t("seeAll")} →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {stages.map((s) => (
            <StageCard
              key={s.id}
              size="sm"
              image={s.bannerUrl ?? "/demo/p01.png"}
              name={s.name}
              sub={`${s.sub ?? ""} · ${s.dayLabel ?? ""}`}
              day={s.dayLabel ?? ""}
              href={`/subir/${s.slug}`}
            />
          ))}
        </div>
      </section>

      {/* PATROCINADORES */}
      <section className="border-t border-surface-2 px-[22px] py-8 lg:py-12">
        <SponsorStrip title={t("sponsors")} />
      </section>
    </main>
  );
}
