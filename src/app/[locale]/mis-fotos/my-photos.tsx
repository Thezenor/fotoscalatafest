"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Clock } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { buttonClass } from "@/components/ui/Button";
import type { Photo } from "@/lib/mock-data";

type Item = { id: string; photo: Photo | null; pending: boolean };

export interface MyPhotosLabels {
  empty: string;
  uploadCta: string;
  reviewing: string;
  approved: string;
}

export function MyPhotos({ labels }: { labels: MyPhotosLabels }) {
  const [items, setItems] = useState<Item[] | null>(null);

  useEffect(() => {
    let ids: string[] = [];
    try {
      ids = JSON.parse(localStorage.getItem("cf_my_photos") ?? "[]");
    } catch {
      ids = [];
    }
    if (!ids.length) {
      setItems([]);
      return;
    }
    (async () => {
      const results = await Promise.all(
        ids.map(async (id) => {
          try {
            const res = await fetch(`/api/photos/${id}`, { cache: "no-store" });
            if (res.ok) {
              const data = await res.json();
              return { id, photo: data.photo ?? data, pending: false } as Item;
            }
          } catch {
            /* red */
          }
          return { id, photo: null, pending: true } as Item;
        }),
      );
      setItems(results);
    })();
  }, []);

  if (items === null) {
    return (
      <div className="columns-2 gap-2.5 md:columns-3 lg:columns-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="mb-2.5 h-40 animate-pulse rounded-sm bg-surface-2" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <p className="font-body text-sm text-mist">{labels.empty}</p>
        <Link href="/escenarios" className={buttonClass({ size: "sm", className: "uppercase" })}>
          {labels.uploadCta}
        </Link>
      </div>
    );
  }

  return (
    <div className="columns-2 gap-2.5 md:columns-3 lg:columns-4">
      {items.map((it) =>
        it.photo ? (
          <Link
            key={it.id}
            href={`/foto/${it.id}`}
            className="group relative mb-2.5 block break-inside-avoid overflow-hidden rounded-sm border border-line"
          >
            <Image
              src={it.photo.thumbUrl}
              alt={it.photo.stageName}
              width={it.photo.width}
              height={it.photo.height}
              sizes="(max-width: 768px) 50vw, 320px"
              className="h-auto w-full object-cover"
            />
            {it.photo.printCode && (
              <span className="absolute left-2 top-2 rounded-pill bg-brand/90 px-2 py-0.5 font-mono text-[9px] font-bold text-brand-ink">
                #{it.photo.printCode}
              </span>
            )}
          </Link>
        ) : (
          <div
            key={it.id}
            className="mb-2.5 flex h-40 break-inside-avoid flex-col items-center justify-center gap-2 rounded-sm border border-dashed border-line bg-surface-2/40 p-3 text-center"
          >
            <Clock className="h-5 w-5 text-brand" />
            <span className="font-body text-[12px] text-mist">{labels.reviewing}</span>
          </div>
        ),
      )}
    </div>
  );
}
