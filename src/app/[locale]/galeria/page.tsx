import type { Metadata } from "next";
import { Home } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/ui/Logo";
import { SiteNav } from "@/components/content/SiteNav";
import { SiteFooter } from "@/components/content/SiteFooter";
import { GalleryView } from "./gallery-view";
import { listApprovedPhotos, listFeaturedPhotos, listStages } from "@/server/services/photo.service";
import { localizedAlternates } from "@/lib/seo";

// Lee de la DB (Prisma) → render dinámico.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "gallery" });
  return {
    title: t("title"),
    alternates: localizedAlternates(locale, "/galeria"),
    openGraph: { title: `${t("title")} · Calatafest Fotos`, url: `/${locale}/galeria` },
  };
}

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("gallery");
  const tc = await getTranslations("common");

  const PAGE = 24;
  const [firstRows, featured, stages] = await Promise.all([
    listApprovedPhotos({ limit: PAGE + 1 }),
    listFeaturedPhotos(),
    listStages(),
  ]);
  const photos = firstRows.slice(0, PAGE);
  const initialHasMore = firstRows.length > PAGE;

  const options = [
    { value: "all", label: t("filters.all") },
    ...stages.map((s) => ({ value: s.slug, label: s.name.replace("Escenario ", "").replace("Carpa ", "") })),
    { value: "VIE", label: t("filters.friday") },
    { value: "SÁB", label: t("filters.saturday") },
  ];

  return (
    <main className="w-full flex-1">
      <SiteNav />
      {/* h1 accesible en móvil (en escritorio hay un h1 visible más abajo) */}
      <h1 className="sr-only lg:hidden">{t("title")}</h1>

      {/* Cabecera móvil */}
      <header className="flex items-center justify-between px-5 py-4 lg:hidden">
        <Link href="/" aria-label={tc("back")}>
          <Logo size={26} wordSize={21} word={t("title").toUpperCase()} />
        </Link>
        <Link
          href="/"
          aria-label="home"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-2 text-white"
        >
          <Home className="h-5 w-5" />
        </Link>
      </header>

      {/* Título escritorio */}
      <div className="mx-auto hidden max-w-7xl px-8 pt-8 lg:block">
        <h1 className="font-display text-4xl font-bold uppercase text-white">{t("title")}</h1>
      </div>

      <GalleryView
        photos={photos}
        initialHasMore={initialHasMore}
        featured={featured}
        options={options}
        featuredLabel={t("featured")}
        emptyLabel={t("empty")}
      />

      <SiteFooter />
    </main>
  );
}
