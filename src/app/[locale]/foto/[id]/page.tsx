import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, MapPin, Calendar, Mic } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { buttonClass } from "@/components/ui/Button";
import { WatermarkLogo } from "@/components/content/WatermarkLogo";
import { QRBlock } from "@/components/content/QRBlock";
import { ShareButton } from "@/components/content/ShareButton";
import { RemovalLink } from "@/components/content/RemovalLink";
import { dayLabel } from "@/lib/mock-data";
import { getPublicPhoto } from "@/server/services/photo.service";

export const dynamic = "force-dynamic";

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

  return (
    <main className="mx-auto w-full max-w-[480px] flex-1 px-5 pb-10">
      <header className="flex items-center justify-between py-4">
        <Link
          href="/galeria"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-2"
          aria-label={tc("back")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <ShareButton label={tc("share")} variant="secondary" />
      </header>

      <div className="relative overflow-hidden rounded-lg">
        <Image
          src={photo.url}
          alt={photo.stageName}
          width={photo.width}
          height={photo.height}
          sizes="480px"
          className="h-auto w-full object-cover"
          priority
        />
        <WatermarkLogo />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
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

      <div className="mt-4 flex gap-3">
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

      <div className="mt-4">
        <QRBlock
          value={`https://fotoscalatafest.com/foto/${photo.id}`}
          size={78}
          title={t("scanToDownload")}
          caption={t("scanCaption")}
        />
      </div>

      <div className="mt-5">
        <RemovalLink photoId={photo.id} label={t("requestRemoval")} />
      </div>
    </main>
  );
}
