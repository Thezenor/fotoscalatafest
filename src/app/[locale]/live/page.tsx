import { getTranslations, setRequestLocale } from "next-intl/server";
import { LiveStage } from "@/components/live/LiveStage";
import { TV_TEMPLATES, type LiveVariant } from "@/components/live/templates";
import {
  listOnScreenPhotos,
  listApprovedPhotos,
  listFeaturedPhotos,
} from "@/server/services/photo.service";
import { getBranding, getTvConfig } from "@/server/services/settings.service";

// Pantalla del recinto: 16:9, sin chrome de navegación.
export const dynamic = "force-dynamic";

// Pantalla de proyección: no se indexa.
export const metadata = { robots: { index: false, follow: false } };

const VALID = new Set(TV_TEMPLATES.map((t) => t.key));

export default async function LivePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ variant?: string; interval?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { variant, interval } = await searchParams;
  const t = await getTranslations("live");

  const [onScreen, approved, featured, branding, tv] = await Promise.all([
    listOnScreenPhotos(),
    listApprovedPhotos(),
    listFeaturedPhotos(),
    getBranding(),
    getTvConfig(),
  ]);
  const pool = onScreen.length ? onScreen : approved;

  // La plantilla por defecto sale de la config de TV; ?variant= la puede sobreescribir.
  const v = (VALID.has(variant as LiveVariant) ? variant : tv.template) as LiveVariant;
  const intervalMs = interval ? Number(interval) : tv.intervalMs;

  const landingUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fotoscalatafest.com";

  return (
    <LiveStage
      photos={pool}
      featured={featured}
      variant={VALID.has(v) ? v : "destacadas"}
      locale={locale}
      landingUrl={landingUrl}
      sponsors={branding.sponsors}
      interval={Number.isFinite(intervalMs) ? intervalMs : 5000}
      showSponsors={tv.showSponsors}
      showQr={tv.showQr}
      labels={{
        liveNow: t("liveNow"),
        scanTitle: t("scanTitle"),
        scanCaption: t("scanCaption"),
        featuredNow: t("featuredNow"),
        sponsors: t("sponsors"),
      }}
    />
  );
}
