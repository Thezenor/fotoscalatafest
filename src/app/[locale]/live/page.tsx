import { getTranslations, setRequestLocale } from "next-intl/server";
import { LiveStage, type LiveVariant } from "@/components/live/LiveStage";
import { getOnScreenPhotos, getApprovedPhotos, getFeaturedPhotos } from "@/lib/mock-data";

// Pantalla del recinto: 16:9, sin chrome de navegación.
export const dynamic = "force-dynamic";

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

  // TODO(backend): GET /api/live (aprobadas + onScreen) con polling/SSE para refresco real.
  const onScreen = getOnScreenPhotos();
  const pool = onScreen.length ? onScreen : getApprovedPhotos();
  const featured = getFeaturedPhotos();

  const landingUrl = "https://fotoscalatafest.com";

  return (
    <LiveStage
      photos={pool}
      featured={featured}
      variant={v}
      locale={locale}
      landingUrl={landingUrl}
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
