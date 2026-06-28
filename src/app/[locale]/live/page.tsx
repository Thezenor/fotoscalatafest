import { getTranslations, setRequestLocale } from "next-intl/server";
import { LiveStage, type LiveVariant } from "@/components/live/LiveStage";
import {
  listOnScreenPhotos,
  listApprovedPhotos,
  listFeaturedPhotos,
} from "@/server/services/photo.service";

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

  // Refresco real-time pendiente (polling/SSE). De momento lee de la DB en cada carga.
  const [onScreen, approved, featured] = await Promise.all([
    listOnScreenPhotos(),
    listApprovedPhotos(),
    listFeaturedPhotos(),
  ]);
  const pool = onScreen.length ? onScreen : approved;

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
