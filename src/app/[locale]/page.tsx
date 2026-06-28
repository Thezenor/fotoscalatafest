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
  const stages = (await listStages()).slice(0, 2);

  return (
    <main className="mx-auto w-full max-w-[480px] flex-1">
      {/* HERO */}
      <section className="relative min-h-[560px] overflow-hidden">
        <Image
          src="/demo/p10.png"
          alt=""
          fill
          priority
          sizes="480px"
          className="object-cover"
        />
        <div className="overlay-vert absolute inset-0" />

        {/* Top bar + marquee */}
        <div className="absolute inset-x-0 top-0">
          <div className="flex items-center justify-between px-5 pb-3 pt-4">
            <Logo size={30} wordSize={18} />
            <LangSwitcher />
          </div>
          <Marquee text={t("marquee")} />
        </div>

        {/* Copy */}
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-[22px]">
          <Eyebrow>{t("eyebrow")}</Eyebrow>
          <h1 className="font-display text-[46px] font-bold uppercase leading-[0.92] text-white">
            {t("title")}
          </h1>
          <p className="max-w-[19rem] font-body text-[15px] text-[#D8D8D8]">
            {t("subtitle")}
          </p>
          <Link href="/escenarios" className={buttonClass({ className: "mt-1 w-full uppercase" })}>
            <Camera className="h-5 w-5" /> {tc("uploadPhoto")}
          </Link>
          <Link
            href="/galeria"
            className={buttonClass({ variant: "secondary", size: "md", className: "w-full uppercase" })}
          >
            {tc("viewGallery")}
          </Link>
        </div>
      </section>

      {/* ELIGE TU ESCENARIO */}
      <section className="flex flex-col gap-4 px-[22px] py-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-[22px] font-bold uppercase text-white">
            {t("chooseStage")}
          </h2>
          <Link href="/escenarios" className="font-body text-[13px] text-brand">
            {t("seeAll")} →
          </Link>
        </div>
        <div className="flex flex-col gap-3">
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
      <section className="border-t border-surface-2 px-[22px] py-6">
        <SponsorStrip title={t("sponsors")} />
      </section>
    </main>
  );
}
