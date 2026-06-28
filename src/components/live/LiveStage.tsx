"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";
import { dayLabel, type Photo } from "@/lib/mock-data";
import type { LiveVariant } from "./templates";

export type { LiveVariant } from "./templates";

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
  interval = 5000,
  showSponsors = true,
  showQr = true,
}: {
  photos: Photo[];
  featured: Photo[];
  variant: LiveVariant;
  labels: LiveLabels;
  locale: string;
  landingUrl: string;
  sponsors?: string[];
  interval?: number;
  showSponsors?: boolean;
  showQr?: boolean;
}) {
  const sponsorList = sponsors && sponsors.length ? sponsors : DEFAULT_SPONSORS;
  const [index, setIndex] = useState(0);
  const [now, setNow] = useState<string>("");
  const [livePhotos, setLivePhotos] = useState<Photo[]>(photos);
  const [liveFeatured, setLiveFeatured] = useState<Photo[]>(featured);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  // "Acaba de llegar": foto subida/aprobada hace < 2 min (solo en cliente).
  const isRecent = (p: Photo) => mounted && !!p.createdAt && Date.now() - Date.parse(p.createdAt) < 120000;

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
      setNow(new Date().toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" }));
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, [locale]);

  // Rotación automática.
  useEffect(() => {
    if (livePhotos.length <= 1) return;
    const id = setInterval(() => setIndex((p) => (p + 1) % livePhotos.length), Math.max(2000, interval));
    return () => clearInterval(id);
  }, [livePhotos.length, interval]);

  const current = livePhotos[index] ?? livePhotos[0];
  const dayUpper = (p: Photo) => dayLabel(p.day, locale).toUpperCase();
  const title = (p: Photo) => p.author?.name ?? p.author?.instagram ?? p.stageName;
  const handle = (p: Photo) => p.author?.instagram ?? "@calatafest2026";
  const sub = (p: Photo) => `${p.stageName.toUpperCase()} · ${dayUpper(p)}`;

  if (!current) {
    return (
      <div className="flex h-dvh w-screen items-center justify-center bg-ink-pure text-white">
        <Logo size={56} wordSize={34} />
      </div>
    );
  }

  // ──────────────── Plantillas dinámicas (pantalla completa) ────────────────
  if (variant === "cinematic") {
    return (
      <Screen>
        <HeroPhoto photo={current} />
        <div className="overlay-vert absolute inset-0" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/20" />
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="animate-sweep absolute top-0 h-full w-1/3 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        <TopLive now={now} day={dayUpper(current)} labels={labels} />

        {current.printCode && (
          <div className="animate-float absolute right-10 top-24 text-right">
            <p className="font-mono text-[15px] uppercase tracking-[0.35em] text-brand/90">CÓDIGO</p>
            <p className="font-display text-[88px] font-black leading-none text-white drop-shadow-[0_4px_30px_rgba(0,0,0,0.6)]">
              #{current.printCode}
            </p>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-8 p-12">
          <div className="max-w-[60%]">
            <p className="font-mono text-[18px] font-semibold uppercase tracking-wide text-brand">{sub(current)}</p>
            <p className="font-display text-[64px] font-black leading-[1.02] text-white">{title(current)}</p>
            <p className="font-body text-[22px] text-[#D8D8D8]">{handle(current)}</p>
          </div>
          {showQr && <ScanCard landingUrl={landingUrl} labels={labels} size={120} />}
        </div>

        {showSponsors && <SponsorMarquee sponsors={sponsorList} labels={labels} />}
      </Screen>
    );
  }

  if (variant === "neon") {
    return (
      <Screen>
        <HeroPhoto photo={current} />
        <div className="overlay-vert absolute inset-0" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{ backgroundImage: "repeating-linear-gradient(0deg, #000 0px, #000 2px, transparent 2px, transparent 4px)" }}
        />
        <div className="animate-glow pointer-events-none absolute inset-5 rounded-xl" />

        <div className="absolute left-10 top-9 flex items-center gap-3">
          <span className="animate-blink inline-block h-3.5 w-3.5 rounded-full bg-brand shadow-[0_0_18px_4px_var(--brand)]" />
          <span className="font-mono text-[20px] font-black uppercase tracking-[0.35em] text-brand drop-shadow-[0_0_10px_rgba(249,180,26,0.8)]">
            {labels.liveNow}
          </span>
        </div>
        <span className="absolute right-12 top-10 font-mono text-[18px] font-semibold uppercase text-white">
          {dayUpper(current)} · {now}
        </span>

        {current.printCode && (
          <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-[140px] font-black tracking-wider text-brand opacity-90 drop-shadow-[0_0_40px_rgba(249,180,26,0.7)]">
            #{current.printCode}
          </p>
        )}

        <div className="absolute inset-x-0 bottom-16 flex items-end justify-between gap-8 px-12">
          <div>
            <p className="font-mono text-[17px] font-semibold uppercase tracking-wide text-brand">{sub(current)}</p>
            <p className="font-display text-[56px] font-black leading-none text-white">{title(current)}</p>
            <p className="font-body text-[20px] text-[#D8D8D8]">{handle(current)}</p>
          </div>
          {showQr && <ScanCard landingUrl={landingUrl} labels={labels} size={110} />}
        </div>

        {showSponsors && <SponsorMarquee sponsors={sponsorList} labels={labels} />}
      </Screen>
    );
  }

  // ──────────────── Plantillas clásicas (marco: top bar + footer) ────────────────
  return (
    <div className="flex h-dvh w-screen flex-col bg-ink-pure text-white">
      {/* TOP BAR */}
      <div className="flex h-[78px] items-center justify-between bg-gradient-to-b from-black/80 to-transparent px-8">
        <Logo size={42} wordSize={28} />
        <div className="flex items-center gap-3">
          <span className="animate-pulse-soft h-2.5 w-2.5 rounded-full bg-brand" />
          <span className="font-mono text-[16px] font-bold uppercase tracking-[0.3em] text-brand">{labels.liveNow}</span>
        </div>
        <span className="font-mono text-[15px] font-semibold uppercase text-mist">
          {dayUpper(current)} · {now}
        </span>
      </div>

      {/* BODY */}
      <div className="flex min-h-0 flex-1 gap-[22px] p-6">
        {variant === "carrusel" && (
          <div className="relative flex-1 overflow-hidden rounded-md">
            <PhotoLayer photo={current} kenBurns />
            <CornerQR landingUrl={landingUrl} labels={labels} show={showQr} />
            <HeroCaption title={title(current)} sub={sub(current)} handle={handle(current)} code={current.printCode} recent={isRecent(current)} />
          </div>
        )}

        {variant === "mosaico" && (
          <div className="relative grid flex-1 grid-cols-3 grid-rows-3 gap-2.5">
            {livePhotos.slice(0, 9).map((p, i) => (
              <div
                key={p.id}
                className={cn(
                  "relative overflow-hidden rounded-sm transition-all duration-700",
                  i === index % Math.min(9, livePhotos.length || 1) && "z-10 ring-2 ring-brand",
                )}
              >
                <PhotoLayer photo={p} />
              </div>
            ))}
            <CornerQR landingUrl={landingUrl} labels={labels} show={showQr} />
          </div>
        )}

        {/* destacadas (por defecto, también si la variante no coincide) */}
        {variant !== "carrusel" && variant !== "mosaico" && variant !== "stack" && (
          <>
            <div className="relative flex-[1.55] overflow-hidden rounded-md">
              <PhotoLayer photo={current} kenBurns />
              <HeroCaption title={title(current)} sub={sub(current)} handle={handle(current)} code={current.printCode} recent={isRecent(current)} />
            </div>
            <div className="flex flex-1 flex-col gap-5">
              {showQr && (
                <div className="flex items-center gap-4 rounded-md bg-white p-5">
                  <QRCodeSVG value={landingUrl} size={118} fgColor="#0E0E0E" bgColor="#fff" />
                  <div>
                    <p className="font-display text-[24px] font-bold leading-tight text-ink">{labels.scanTitle}</p>
                    <p className="mt-1 font-body text-[15px] text-[#444]">{labels.scanCaption}</p>
                  </div>
                </div>
              )}
              <p className="font-mono text-[13px] uppercase tracking-[0.2em] text-mist-2">{labels.featuredNow}</p>
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

        {/* stack (polaroid) */}
        {variant === "stack" && (
          <div className="relative flex flex-1 items-center justify-center overflow-hidden rounded-md bg-gradient-to-br from-surface to-ink-pure">
            <StackDeck photos={livePhotos} index={index} title={title} sub={sub} handle={handle} />
            {showQr && (
              <div className="absolute right-6 top-6">
                <ScanCard landingUrl={landingUrl} labels={labels} size={96} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="flex h-[96px] items-center justify-between border-t border-surface-2 bg-ink px-8">
        <div className="flex flex-col gap-1.5">
          <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-mist-2">{labels.sponsors}</span>
          <div className="flex items-center gap-4 opacity-75">
            {sponsorList.map((s) => (
              <span key={s} className="font-body text-[14px] font-semibold">{s}</span>
            ))}
          </div>
        </div>
        <span className="font-display text-[18px] font-bold text-brand">#CALATAFEST2026 · fotoscalatafest.com</span>
      </div>
    </div>
  );
}

// ─────────────────────────── Piezas ───────────────────────────

function Screen({ children }: { children: React.ReactNode }) {
  return <div className="relative h-dvh w-screen overflow-hidden bg-ink-pure text-white">{children}</div>;
}

/** Foto clásica (next/image) con zoom lento opcional. */
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

/** Foto a pantalla completa con crossfade entre tomas + zoom lento (dinámicas). */
function HeroPhoto({ photo }: { photo: Photo }) {
  const seq = useRef(0);
  const [layers, setLayers] = useState<{ k: number; url: string }[]>([{ k: 0, url: photo.url }]);
  useEffect(() => {
    setLayers((prev) => {
      if (prev[prev.length - 1]?.url === photo.url) return prev;
      seq.current += 1;
      return [...prev, { k: seq.current, url: photo.url }].slice(-2);
    });
  }, [photo.url]);
  return (
    <div className="absolute inset-0 overflow-hidden bg-ink-pure">
      {layers.map((l, i) => (
        <div key={l.k} className={cn("absolute inset-0", i === layers.length - 1 && "animate-tv-fade")}>
          <div className="animate-tv-zoom absolute inset-0">
            <Image src={l.url} alt="" fill sizes="100vw" className="object-cover" priority={i === layers.length - 1} />
          </div>
        </div>
      ))}
    </div>
  );
}

function TopLive({ now, day, labels }: { now: string; day: string; labels: LiveLabels }) {
  return (
    <>
      <div className="absolute left-10 top-9 flex items-center gap-3">
        <span className="animate-pulse-soft h-3 w-3 rounded-full bg-brand" />
        <span className="font-mono text-[18px] font-black uppercase tracking-[0.32em] text-brand">{labels.liveNow}</span>
      </div>
      <span className="absolute right-12 top-10 font-mono text-[18px] font-semibold uppercase text-mist">
        {day} · {now}
      </span>
    </>
  );
}

function ScanCard({ landingUrl, labels, size = 110 }: { landingUrl: string; labels: LiveLabels; size?: number }) {
  return (
    <div className="flex items-center gap-3 rounded-md bg-white p-3.5 shadow-card">
      <QRCodeSVG value={landingUrl} size={size} fgColor="#0E0E0E" bgColor="#fff" />
      <div className="pr-1">
        <p className="font-display text-[20px] font-bold leading-tight text-ink">{labels.scanTitle}</p>
        <p className="font-body text-[13px] text-[#444]">{labels.scanCaption}</p>
      </div>
    </div>
  );
}

function CornerQR({ landingUrl, labels, show = true }: { landingUrl: string; labels: LiveLabels; show?: boolean }) {
  if (!show) return null;
  return (
    <div className="absolute right-5 top-5 flex items-center gap-3 rounded-md bg-white p-3">
      <QRCodeSVG value={landingUrl} size={84} fgColor="#0E0E0E" bgColor="#fff" />
      <div className="pr-1">
        <p className="font-display text-[17px] font-bold leading-tight text-ink">{labels.scanTitle}</p>
        <p className="font-body text-[12px] text-[#444]">{labels.scanCaption}</p>
      </div>
    </div>
  );
}

function SponsorMarquee({ sponsors, labels }: { sponsors: string[]; labels: LiveLabels }) {
  const loop = [...sponsors, ...sponsors];
  return (
    <div className="absolute inset-x-0 bottom-0 flex items-center border-t border-white/10 bg-black/55 py-3 backdrop-blur">
      <span className="shrink-0 px-8 font-mono text-[11px] uppercase tracking-[0.28em] text-brand">{labels.sponsors}</span>
      <div className="relative flex-1 overflow-hidden">
        <div className="animate-marquee flex w-max items-center gap-10 whitespace-nowrap">
          {loop.map((s, i) => (
            <span key={`${s}-${i}`} className="font-body text-[16px] font-semibold text-white/85">{s}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Mazo de tarjetas: la actual entra animada sobre las dos anteriores. */
function StackDeck({
  photos,
  index,
  title,
  sub,
  handle,
}: {
  photos: Photo[];
  index: number;
  title: (p: Photo) => string;
  sub: (p: Photo) => string;
  handle: (p: Photo) => string;
}) {
  const n = photos.length;
  if (!n) return null;
  const at = (off: number) => photos[((index - off) % n + n) % n];
  const front = at(0);
  return (
    <div className="relative h-[78%] w-[58%]">
      <Card photo={at(2)} className="-rotate-6 scale-90 opacity-40" />
      <Card photo={at(1)} className="rotate-3 scale-95 opacity-70" />
      <div key={front.id} className="animate-tv-card absolute inset-0">
        <Card photo={front} front title={title(front)} sub={sub(front)} handle={handle(front)} />
      </div>
    </div>
  );
}

function Card({
  photo,
  className,
  front,
  title,
  sub,
  handle,
}: {
  photo: Photo;
  className?: string;
  front?: boolean;
  title?: string;
  sub?: string;
  handle?: string;
}) {
  return (
    <div className={cn("absolute inset-0 overflow-hidden rounded-lg border-4 border-white bg-white shadow-card", className)}>
      <div className="relative h-full w-full">
        <Image src={photo.url} alt="" fill sizes="60vw" className="object-cover" />
        {front && (
          <>
            <div className="overlay-vert absolute inset-0" />
            {photo.printCode && (
              <span className="absolute left-4 top-4 rounded-pill bg-brand px-4 py-1.5 font-mono text-[20px] font-bold text-brand-ink">
                #{photo.printCode}
              </span>
            )}
            <div className="absolute inset-x-0 bottom-0 p-6">
              <p className="font-mono text-[14px] font-semibold uppercase tracking-wide text-brand">{sub}</p>
              <p className="font-display text-[36px] font-bold leading-tight text-white">{title}</p>
              <p className="font-body text-[16px] text-[#D8D8D8]">{handle}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function HeroCaption({ title, sub, handle, code, recent }: { title: string; sub: string; handle: string; code?: string; recent?: boolean }) {
  return (
    <>
      <div className="overlay-vert absolute inset-0" />
      <div className="absolute left-5 top-5 flex items-center gap-2">
        {code && (
          <span className="rounded-pill bg-brand px-4 py-1.5 font-mono text-[18px] font-bold text-brand-ink">
            #{code}
          </span>
        )}
        {recent && (
          <span className="animate-pulse-soft rounded-pill bg-white px-3 py-1.5 font-display text-[14px] font-bold uppercase text-ink">
            ¡Acaba de llegar!
          </span>
        )}
      </div>
      <div className="absolute inset-x-0 bottom-0 p-8">
        <p className="font-mono text-[14px] font-semibold uppercase tracking-wide text-brand">{sub}</p>
        <p className="font-display text-[38px] font-bold leading-tight text-white">{title}</p>
        <p className="font-body text-[17px] text-[#D8D8D8]">{handle}</p>
      </div>
    </>
  );
}
