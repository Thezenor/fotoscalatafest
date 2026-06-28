"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { buttonClass } from "@/components/ui/Button";
import { FeaturedCarousel } from "@/components/content/FeaturedCarousel";
import { FilterChips, type ChipOption } from "@/components/content/FilterChips";
import { PhotoCard } from "@/components/content/PhotoCard";
import { dayLabel, type Photo } from "@/lib/mock-data";

const PAGE = 24;

function filterToQuery(filter: string): string {
  if (filter === "all") return "";
  if (filter === "VIE" || filter === "SÁB") return `&day=${encodeURIComponent(filter)}`;
  return `&stage=${encodeURIComponent(filter)}`;
}

export function GalleryView({
  photos: initial,
  initialHasMore,
  featured,
  options,
  featuredLabel,
  emptyLabel,
}: {
  photos: Photo[];
  initialHasMore: boolean;
  featured: Photo[];
  options: ChipOption[];
  featuredLabel: string;
  emptyLabel: string;
}) {
  const locale = useLocale();
  const router = useRouter();
  const tc = useTranslations("common");
  const [filter, setFilter] = useState("all");
  const [photos, setPhotos] = useState<Photo[]>(initial);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const offsetRef = useRef(initial.length);
  const sentinel = useRef<HTMLDivElement | null>(null);

  // Cambia de filtro → recarga la primera página desde el servidor.
  async function changeFilter(f: string) {
    setFilter(f);
    setLoading(true);
    try {
      const res = await fetch(`/api/photos?limit=${PAGE}&offset=0${filterToQuery(f)}`, { cache: "no-store" });
      const data = await res.json();
      setPhotos(data.photos ?? []);
      setHasMore(!!data.hasMore);
      offsetRef.current = (data.photos ?? []).length;
    } finally {
      setLoading(false);
    }
  }

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/photos?limit=${PAGE}&offset=${offsetRef.current}${filterToQuery(filter)}`,
        { cache: "no-store" },
      );
      const data = await res.json();
      const next: Photo[] = data.photos ?? [];
      setPhotos((prev) => [...prev, ...next]);
      offsetRef.current += next.length;
      setHasMore(!!data.hasMore);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, filter]);

  // Scroll infinito vía IntersectionObserver.
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => entries[0].isIntersecting && loadMore(),
      { rootMargin: "600px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [loadMore]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
      <div className="px-5 lg:px-8">
        <FeaturedCarousel
          slides={featured}
          featuredLabel={featuredLabel}
          caption={(p) => `${dayLabel(p.day, locale)}${p.time ? ` · ${p.time}` : ""}`}
        />
      </div>

      <div className="sticky top-0 z-30 bg-ink/90 py-2 backdrop-blur lg:top-[69px] lg:px-3">
        <FilterChips options={options} value={filter} onChange={changeFilter} />
      </div>

      {photos.length === 0 && !loading ? (
        <div className="flex flex-col items-center gap-4 px-5 py-12 text-center">
          <p className="font-body text-sm text-mist">{emptyLabel}</p>
          <Link href="/escenarios" className={buttonClass({ size: "sm", className: "uppercase" })}>
            {tc("uploadPhoto")}
          </Link>
        </div>
      ) : (
        <div className="columns-2 gap-2.5 px-5 pb-4 md:columns-3 lg:columns-4 lg:px-8">
          {photos.map((p) => (
            <PhotoCard
              key={p.id}
              photo={p}
              label={`${p.stageName.replace("Escenario ", "")} · ${p.day}`}
              onDownload={(ph) => {
                // Gratis: descarga directa de la imagen mostrada.
                // De pago: lleva a la ficha para conseguir/imprimir la alta calidad.
                if (ph.downloadFree) {
                  const a = document.createElement("a");
                  a.href = ph.url;
                  a.download = `calatafest-${ph.printCode ?? ph.id}.jpg`;
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                } else {
                  router.push(`/foto/${ph.id}`);
                }
              }}
              onShare={async (ph) => {
                const url = `${window.location.origin}/${locale}/foto/${ph.id}`;
                if (navigator.share) await navigator.share({ url }).catch(() => {});
                else await navigator.clipboard.writeText(url);
              }}
            />
          ))}
        </div>
      )}

      {/* Sentinela de scroll infinito */}
      <div ref={sentinel} className="h-10" />
      {loading && (
        <p className="pb-8 text-center font-mono text-xs uppercase tracking-wide text-mist">
          {tc("loading")}
        </p>
      )}
    </div>
  );
}
