import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Camera, Lock } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/ui/Logo";
import { buttonClass } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Marquee } from "@/components/content/Marquee";
import { StageCard } from "@/components/content/StageCard";
import { SponsorStrip } from "@/components/content/SponsorStrip";
import { LangSwitcher } from "@/components/content/LangSwitcher";
import { SiteNav } from "@/components/content/SiteNav";
import { JsonLd } from "@/components/seo/JsonLd";
import { listStages, getActiveEvent } from "@/server/services/photo.service";
import { getBranding } from "@/server/services/settings.service";
import { siteUrl, absoluteUrl } from "@/lib/seo";

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
  const ts = await getTranslations("superadmin");
  const [stages, event, branding] = await Promise.all([
    listStages(),
    getActiveEvent(),
    getBranding(),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event?.name ?? "Calatafest",
    url: `${siteUrl()}/${locale}`,
    image: absoluteUrl("/demo/p10.png"),
    ...(event?.startsAt ? { startDate: event.startsAt.toISOString() } : {}),
    ...(event?.endsAt ? { endDate: event.endsAt.toISOString() } : {}),
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: { "@type": "Place", name: "Calatayud", address: "Calatayud, España" },
    organizer: { "@type": "Organization", name: "Calatafest", url: "https://www.calatafest.es" },
    description: t("subtitle"),
  };

  return (
    <main className="w-full flex-1">
      <JsonLd data={jsonLd} />
      <SiteNav floating />

      {/* HERO */}
      <section className="relative min-h-[480px] overflow-hidden lg:min-h-[62vh]">
        <Image src="/demo/p10.png" alt="" fill priority sizes="100vw" className="object-cover" />
        <div className="overlay-vert absolute inset-0" />
        <div className="absolute inset-0 hidden bg-gradient-to-r from-ink/80 via-ink/20 to-transparent lg:block" />

        {/* Top bar móvil + marquee */}
        <div className="absolute inset-x-0 top-0 lg:hidden">
          <div className="flex items-center justify-between px-5 pb-3 pt-4">
            <Logo size={30} wordSize={18} />
            <div className="flex items-center gap-2">
              <Link
                href="/superadmin"
                aria-label={ts("openPanel")}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 text-white"
              >
                <Lock className="h-4 w-4" />
              </Link>
              <LangSwitcher />
            </div>
          </div>
          <Marquee text={t("marquee")} />
        </div>
        <div className="absolute inset-x-0 top-[68px] hidden lg:block">
          <Marquee text={t("marquee")} />
        </div>

        {/* Copy */}
        <div className="absolute inset-x-0 bottom-0">
          <div className="mx-auto max-w-7xl px-[22px] pb-6 lg:px-8 lg:pb-10">
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
      <section className="mx-auto max-w-7xl px-[22px] pb-10 pt-7 lg:px-8 lg:pb-16 lg:pt-9">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h2 className="font-display text-[24px] font-bold uppercase text-white lg:text-4xl">
              {t("chooseStage")}
            </h2>
            <p className="mt-1 font-body text-[14px] text-mist lg:text-base">{t("chooseStageHint")}</p>
          </div>
          <Link
            href="/escenarios"
            className="shrink-0 font-body text-[13px] font-semibold text-brand hover:underline lg:text-base"
          >
            {t("seeAll")} →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {stages.map((s) => (
            <StageCard
              key={s.id}
              image={s.bannerUrl ?? "/demo/p01.png"}
              name={s.name}
              sub={s.sub ?? ""}
              day={s.dayLabel ?? ""}
              href={`/subir/${s.slug}`}
              cta={tc("uploadShort")}
            />
          ))}
        </div>
      </section>

      {/* PATROCINADORES */}
      <section className="flex flex-col items-center gap-6 border-t border-surface-2 px-[22px] py-8 lg:py-12">
        <SponsorStrip title={t("sponsors")} sponsors={branding.sponsors} />
      </section>
    </main>
  );
}
