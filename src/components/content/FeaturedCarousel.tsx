"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Star } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import type { Photo } from "@/lib/mock-data";

export function FeaturedCarousel({
  slides,
  featuredLabel,
  caption,
  autoPlay = true,
  interval = 4500,
}: {
  slides: Photo[];
  featuredLabel: string;
  caption: (p: Photo) => string;
  autoPlay?: boolean;
  interval?: number;
}) {
  const router = useRouter();
  const [i, setI] = useState(0);

  useEffect(() => {
    if (!autoPlay || slides.length <= 1) return;
    const id = setInterval(() => setI((p) => (p + 1) % slides.length), interval);
    return () => clearInterval(id);
  }, [autoPlay, interval, slides.length]);

  if (slides.length === 0) return null;
  const photo = slides[i];

  return (
    <div className="relative h-[200px] w-full overflow-hidden rounded-lg">
      {slides.map((s, idx) => (
        <Image
          key={s.id}
          src={s.url}
          alt={s.stageName}
          fill
          priority={idx === 0}
          sizes="(max-width: 768px) 100vw, 600px"
          className={cn(
            "object-cover transition-opacity duration-700",
            idx === i ? "opacity-100" : "opacity-0",
          )}
        />
      ))}
      <div className="overlay-vert absolute inset-0" />

      <Badge className="absolute left-3 top-3">
        <Star className="h-3 w-3 fill-current" /> {featuredLabel}
      </Badge>

      <button
        type="button"
        onClick={() => router.push(`/foto/${photo.id}`)}
        className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-0.5 p-4 text-left"
      >
        <span className="font-display text-[20px] font-bold leading-tight text-white">
          {photo.stageName}
        </span>
        <span className="font-body text-[13px] text-mist">{caption(photo)}</span>
      </button>

      <div className="absolute bottom-4 right-4 flex gap-1.5">
        {slides.map((s, idx) => (
          <button
            key={s.id}
            type="button"
            aria-label={`slide ${idx + 1}`}
            onClick={() => setI(idx)}
            className={cn(
              "h-1.5 rounded-full transition-all",
              idx === i ? "w-4 bg-brand" : "w-1.5 bg-white/40",
            )}
          />
        ))}
      </div>
    </div>
  );
}
