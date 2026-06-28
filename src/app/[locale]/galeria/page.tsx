import { Search } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Logo } from "@/components/ui/Logo";
import { IconButton } from "@/components/ui/IconButton";
import { GalleryView } from "./gallery-view";
import { getApprovedPhotos, getFeaturedPhotos, getStages } from "@/lib/mock-data";

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("gallery");

  // TODO(backend): GET /api/photos?status=approved (con ISR/revalidate corto).
  const photos = getApprovedPhotos();
  const featured = getFeaturedPhotos();
  const stages = getStages();

  const options = [
    { value: "all", label: t("filters.all") },
    ...stages.map((s) => ({ value: s.id, label: s.name.replace("Escenario ", "").replace("Carpa ", "") })),
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
