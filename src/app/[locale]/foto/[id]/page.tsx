import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, MapPin, Calendar, Mic, ShoppingBag } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { buttonClass } from "@/components/ui/Button";
import { WatermarkLogo } from "@/components/content/WatermarkLogo";
import { QRBlock } from "@/components/content/QRBlock";
import { ShareButton } from "@/components/content/ShareButton";
import { RemovalLink } from "@/components/content/RemovalLink";
import { SiteNav } from "@/components/content/SiteNav";
import { JsonLd } from "@/components/seo/JsonLd";
import { dayLabel } from "@/lib/mock-data";
import { getPublicPhoto } from "@/server/services/photo.service";
import { absoluteUrl, localizedAlternates } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const photo = await getPublicPhoto(id);
  if (!photo) return { title: "Calatafest Fotos" };
  const title = photo.author?.name ?? photo.author?.instagram ?? photo.stageName;
  const og = absoluteUrl(photo.url);
  return {
    title,
    description: `${photo.stageName} · ${dayLabel(photo.day, locale)} — Calatafest Fotos`,
    alternates: localizedAlternates(locale, `/foto/${id}`),
    openGraph: {
      type: "article",
      title: `${title} · Calatafest Fotos`,
      url: `/${locale}/foto/${id}`,
      images: [{ url: og, width: photo.width, height: photo.height, alt: photo.stageName }],
    },
    twitter: { card: "summary_large_image", images: [og] },
  };
}

export default async function PhotoPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("photo");
  const tc = await getTranslations("common");

  const photo = await getPublicPhoto(id);
  if (!photo) notFound();

  const chip =
    "inline-flex items-center gap-1.5 rounded-pill border border-line bg-surface-2 px-3 py-1.5 font-mono text-[11px] uppercase text-white";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    contentUrl: absoluteUrl(photo.url),
    name: photo.stageName,
    creditText: photo.author?.name ?? photo.author?.instagram ?? "Calatafest",
    isPartOf: { "@type": "Event", name: "Calatafest" },
  };

  return (
    <main className="w-full flex-1">
      <JsonLd data={jsonLd} />
      <SiteNav />

      {/* Cabecera móvil */}
      <header className="flex items-center justify-between px-5 py-4 lg:hidden">
        <Link
          href="/galeria"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-2"
          aria-label={tc("back")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <ShareButton label={tc("share")} variant="secondary" />
      </header>

      <div className="mx-auto max-w-5xl px-5 pb-12 lg:px-8 lg:pt-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.5fr_1fr] lg:gap-10">
          {/* Foto */}
          <div className="relative h-fit overflow-hidden rounded-lg">
            <Image
              src={photo.url}
              alt={photo.stageName}
              width={photo.width}
              height={photo.height}
              sizes="(max-width: 1024px) 100vw, 720px"
              className="h-auto w-full object-cover"
              priority
            />
            <WatermarkLogo />
          </div>

          {/* Panel lateral (meta + acciones + QR) */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              <span className={chip}>
                <MapPin className="h-3.5 w-3.5 text-brand" /> {photo.stageName}
              </span>
              <span className={chip}>
                <Calendar className="h-3.5 w-3.5 text-brand" /> {dayLabel(photo.day, locale)}
                {photo.time ? ` ${photo.time}` : ""}
              </span>
              <span className={chip}>
                <Mic className="h-3.5 w-3.5 text-brand" /> Set principal
              </span>
            </div>

            <div className="flex gap-3">
              {/* TODO(backend): /api/photos/:id/download (alta calidad con marca de agua) */}
              <a
                href={photo.url}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClass({ size: "md", className: "flex-1 uppercase" })}
              >
                <Download className="h-5 w-5" /> {tc("download")}
              </a>
              <ShareButton label="" url={`/foto/${photo.id}`} variant="secondary" />
            </div>

            <Link href={`/comprar/${photo.id}`} className={buttonClass({ variant: "secondary", size: "md", className: "w-full uppercase" })}>
              <ShoppingBag className="h-5 w-5" /> Conseguir / imprimir
            </Link>

            <QRBlock
              value={`https://fotoscalatafest.com/foto/${photo.id}`}
              size={78}
              title={t("scanToDownload")}
              caption={t("scanCaption")}
            />

            <div className="mt-1">
              <RemovalLink photoId={photo.id} label={t("requestRemoval")} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
