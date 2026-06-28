"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";
import { dayLabel, type Photo } from "@/lib/mock-data";

export type LiveVariant = "destacadas" | "carrusel" | "mosaico";

export interface LiveLabels {
  liveNow: string;
  scanTitle: string;
  scanCaption: string;
  featuredNow: string;
  sponsors: string;
}

const DEFAULT_SPONSORS = ["Heraldo", "Coca-Cola", "Beefeater", "Ibercaja", "Ámbar"];

export function LiveStage({
  photos,
  featured,
  variant,
  labels,
  locale,
  landingUrl,
  sponsors,
  interval = 3800,
}: {
  photos: Photo[];
  featured: Photo[];
  variant: LiveVariant;
  labels: LiveLabels;
  locale: string;
  landingUrl: string;
  sponsors?: string[];
  interval?: number;
}) {
  const sponsorList = sponsors && sponsors.length ? sponsors : DEFAULT_SPONSORS;
  const [index, setIndex] = useState(0);
  const [now, setNow] = useState<string>("");
  const [livePhotos, setLivePhotos] = useState<Photo[]>(photos);
  const [liveFeatured, setLiveFeatured] = useState<Photo[]>(featured);

  // Refresco en tiempo real: sondea /api/live cada 20s para traer fotos nuevas.
  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const res = await fetch("/api/live", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data.photos)) setLivePhotos(data.photos);
        if (Array.isArray(data.featured)) setLiveFeatured(data.featured);
      } catch {
        /* reintenta en el siguiente tick */
      }
    }, 20000);
    return () => clearInterval(id);
  }, []);

  // Reloj en vivo (cliente).
  useEffect(() => {
    const tick = () =>
      setNow(
        new Date().toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" }),
      );
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, [locale]);

  // Rotación automática.
  useEffect(() => {
    if (livePhotos.length <= 1) return;
    const id = setInterval(() => setIndex((p) => (p + 1) % livePhotos.length), interval);
    return () => clearInterval(id);
  }, [livePhotos.length, interval]);

  const current = livePhotos[index] ?? livePhotos[0];
  const dayUpper = (p: Photo) => dayLabel(p.day, locale).toUpperCase();
  const title = (p: Photo) => p.author?.name ?? p.author?.instagram ?? p.stageName;
  const handle = (p: Photo) => p.author?.instagram ?? "@calatafest2026";

  return (
    <div className="flex h-dvh w-screen flex-col bg-ink-pure text-white">
      {/* TOP BAR */}
      <div className="flex h-[78px] items-center justify-between bg-gradient-to-b from-black/80 to-transparent px-8">
        <Logo size={42} wordSize={28} />
        <div className="flex items-center gap-3">
          <span className="h-2.5 w-2.5 animate-pulse-soft rounded-full bg-brand" />
          <span className="font-mono text-[16px] font-bold uppercase tracking-[0.3em] text-brand">
            {labels.liveNow}
          </span>
        </div>
        <span className="font-mono text-[15px] font-semibold uppercase text-mist">
          {current ? dayUpper(current) : ""} · {now}
        </span>
      </div>

      {/* BODY */}
      <div className="flex min-h-0 flex-1 gap-[22px] p-6">
        {variant === "carrusel" && current && (
          <div className="relative flex-1 overflow-hidden rounded-md">
            <PhotoLayer photo={current} kenBurns />
            <CornerQR landingUrl={landingUrl} labels={labels} />
            <HeroCaption title={title(current)} sub={`${current.stageName.toUpperCase()} · ${dayUpper(current)}`} handle={handle(current)} code={current.printCode} />
          </div>
        )}

        {variant === "mosaico" && (
          <div className="relative grid flex-1 grid-cols-3 grid-rows-3 gap-2.5">
            {livePhotos.slice(0, 9).map((p, i) => (
              <div key={p.id} className={cn("relative overflow-hidden rounded-sm", i === index % 9 && "ring-2 ring-brand")}>
                <PhotoLayer photo={p} />
              </div>
            ))}
            <CornerQR landingUrl={landingUrl} labels={labels} />
          </div>
        )}

        {variant === "destacadas" && current && (
          <>
            <div className="relative flex-[1.55] overflow-hidden rounded-md">
              <PhotoLayer photo={current} kenBurns />
              <HeroCaption title={title(current)} sub={`${current.stageName.toUpperCase()} · ${dayUpper(current)}`} handle={handle(current)} code={current.printCode} />
            </div>
            <div className="flex flex-1 flex-col gap-5">
              <div className="flex items-center gap-4 rounded-md bg-white p-5">
                <div className="rounded bg-white">
                  <QRCodeSVG value={landingUrl} size={118} fgColor="#0E0E0E" bgColor="#fff" />
                </div>
                <div>
                  <p className="font-display text-[24px] font-bold leading-tight text-ink">
                    {labels.scanTitle}
                  </p>
                  <p className="mt-1 font-body text-[15px] text-[#444]">{labels.scanCaption}</p>
                </div>
              </div>
              <p className="font-mono text-[13px] uppercase tracking-[0.2em] text-mist-2">
                {labels.featuredNow}
              </p>
              <div className="grid flex-1 grid-cols-3 gap-3">
                {(liveFeatured.length ? liveFeatured : livePhotos).slice(0, 3).map((p) => (
                  <div key={p.id} className="relative overflow-hidden rounded-sm">
                    <PhotoLayer photo={p} />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* FOOTER */}
      <div className="flex h-[96px] items-center justify-between border-t border-surface-2 bg-ink px-8">
        <div className="flex flex-col gap-1.5">
          <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-mist-2">
            {labels.sponsors}
          </span>
          <div className="flex items-center gap-4 opacity-75">
            {sponsorList.map((s) => (
              <span key={s} className="font-body text-[14px] font-semibold">
                {s}
              </span>
            ))}
          </div>
        </div>
        <span className="font-display text-[18px] font-bold text-brand">
          #CALATAFEST2026 · fotoscalatafest.com
        </span>
      </div>
    </div>
  );
}

function PhotoLayer({ photo, kenBurns }: { photo: Photo; kenBurns?: boolean }) {
  return (
    <Image
      src={photo.url}
      alt={photo.stageName}
      fill
      sizes="100vw"
      className={cn("object-cover", kenBurns && "animate-kenburns")}
      priority
    />
  );
}

function HeroCaption({ title, sub, handle, code }: { title: string; sub: string; handle: string; code?: string }) {
  return (
    <>
      <div className="overlay-vert absolute inset-0" />
      {code && (
        <span className="absolute left-5 top-5 rounded-pill bg-brand px-4 py-1.5 font-mono text-[18px] font-bold text-brand-ink">
          #{code}
        </span>
      )}
      <div className="absolute inset-x-0 bottom-0 p-8">
        <p className="font-mono text-[14px] font-semibold uppercase tracking-wide text-brand">
          {sub}
        </p>
        <p className="font-display text-[38px] font-bold leading-tight text-white">{title}</p>
        <p className="font-body text-[17px] text-[#D8D8D8]">{handle}</p>
      </div>
    </>
  );
}

function CornerQR({ landingUrl, labels }: { landingUrl: string; labels: LiveLabels }) {
  return (
    <div className="absolute right-5 top-5 flex items-center gap-3 rounded-md bg-white p-3">
      <QRCodeSVG value={landingUrl} size={84} fgColor="#0E0E0E" bgColor="#fff" />
      <div className="pr-1">
        <p className="font-display text-[17px] font-bold leading-tight text-ink">
          {labels.scanTitle}
        </p>
        <p className="font-body text-[12px] text-[#444]">{labels.scanCaption}</p>
      </div>
    </div>
  );
}
