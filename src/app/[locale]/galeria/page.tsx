import { Search } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Logo } from "@/components/ui/Logo";
import { IconButton } from "@/components/ui/IconButton";
import { GalleryView } from "./gallery-view";
import { listApprovedPhotos, listFeaturedPhotos, listStages } from "@/server/services/photo.service";

// Lee de la DB (Prisma) → render dinámico.
export const dynamic = "force-dynamic";

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("gallery");

  const [photos, featured, stages] = await Promise.all([
    listApprovedPhotos(),
    listFeaturedPhotos(),
    listStages(),
  ]);

  const options = [
    { value: "all", label: t("filters.all") },
    ...stages.map((s) => ({ value: s.slug, label: s.name.replace("Escenario ", "").replace("Carpa ", "") })),
    { value: "VIE", label: t("filters.friday") },
    { value: "SÁB", label: t("filters.saturday") },
  ];

  return (
    <main className="mx-auto w-full max-w-[480px] flex-1">
      <header className="flex items-center justify-between px-5 py-4">
        <Logo size={26} wordSize={21} word={t("title").toUpperCase()} />
        <IconButton aria-label="search">
          <Search className="h-5 w-5" />
        </IconButton>
      </header>
      <GalleryView
        photos={photos}
        featured={featured}
        options={options}
        featuredLabel={t("featured")}
        emptyLabel={t("empty")}
      />
    </main>
  );
}
