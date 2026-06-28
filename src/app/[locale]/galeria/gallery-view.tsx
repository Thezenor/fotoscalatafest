"use client";

import { useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { FeaturedCarousel } from "@/components/content/FeaturedCarousel";
import { FilterChips, type ChipOption } from "@/components/content/FilterChips";
import { PhotoCard } from "@/components/content/PhotoCard";
import { dayLabel, type Photo } from "@/lib/mock-data";

export function GalleryView({
  photos,
  featured,
  options,
  featuredLabel,
  emptyLabel,
}: {
  photos: Photo[];
  featured: Photo[];
  options: ChipOption[];
  featuredLabel: string;
  emptyLabel: string;
}) {
  const locale = useLocale();
  const [filter, setFilter] = useState("all");

  const filtered = useMemo(() => {
    if (filter === "all") return photos;
    if (filter === "VIE" || filter === "SÁB") return photos.filter((p) => p.day === filter);
    return photos.filter((p) => p.stageId === filter);
  }, [filter, photos]);

  return (
    <div className="flex flex-col gap-4">
      <div className="px-5">
        <FeaturedCarousel
          slides={featured}
          featuredLabel={featuredLabel}
          caption={(p) =>
            `${dayLabel(p.day, locale)}${p.time ? ` · ${p.time}` : ""}`
          }
        />
      </div>

      <div className="sticky top-0 z-30 bg-ink/90 py-2 backdrop-blur">
        <FilterChips options={options} value={filter} onChange={setFilter} />
      </div>

      {filtered.length === 0 ? (
        <p className="px-5 py-10 text-center font-body text-sm text-mist">{emptyLabel}</p>
      ) : (
        <div className="columns-2 gap-2.5 px-5 pb-10">
          {filtered.map((p) => (
            <PhotoCard
              key={p.id}
              photo={p}
              label={`${p.stageName.replace("Escenario ", "")} · ${p.day}`}
              onDownload={(ph) => window.open(ph.url, "_blank")}
              onShare={async (ph) => {
                const url = `${window.location.origin}/${locale}/foto/${ph.id}`;
                if (navigator.share) await navigator.share({ url }).catch(() => {});
                else await navigator.clipboard.writeText(url);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
