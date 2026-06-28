import { getTranslations, setRequestLocale } from "next-intl/server";
import { LiveStage, type LiveVariant } from "@/components/live/LiveStage";
import {
  listOnScreenPhotos,
  listApprovedPhotos,
  listFeaturedPhotos,
} from "@/server/services/photo.service";
import { getBranding } from "@/server/services/settings.service";

// Pantalla del recinto: 16:9, sin chrome de navegación.
export const dynamic = "force-dynamic";

// Pantalla de proyección: no se indexa.
export const metadata = { robots: { index: false, follow: false } };

const VARIANTS: LiveVariant[] = ["destacadas", "carrusel", "mosaico"];

export default async function LivePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ variant?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { variant } = await searchParams;
  const t = await getTranslations("live");

  const v = (VARIANTS.includes(variant as LiveVariant) ? variant : "destacadas") as LiveVariant;

  // Refresco real-time pendiente (polling/SSE). De momento lee de la DB en cada carga.
  const [onScreen, approved, featured, branding] = await Promise.all([
    listOnScreenPhotos(),
    listApprovedPhotos(),
    listFeaturedPhotos(),
    getBranding(),
  ]);
  const pool = onScreen.length ? onScreen : approved;

  const landingUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fotoscalatafest.com";

  return (
    <LiveStage
      photos={pool}
      featured={featured}
      variant={v}
      locale={locale}
      landingUrl={landingUrl}
      sponsors={branding.sponsors}
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
