"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { Check, X, Star, MonitorPlay, RotateCcw } from "lucide-react";
import { ModerationCard, type ModerationLabels } from "./ModerationCard";
import { FilterChips, type ChipOption } from "@/components/content/FilterChips";
import { dayLabel, type Photo } from "@/lib/mock-data";
import { moderateAction, revertModerationAction } from "@/server/actions/moderation";
import { cn } from "@/lib/utils";

type ActionKind = "approve" | "reject" | "feature" | "screen";

export interface ModerationViewLabels extends ModerationLabels {
  inQueue: string;
  pendingShort: string;
  todayOk: string;
  onScreen: string;
  queueEmpty: string;
  undo: string;
  toastApproved: string;
  toastRejected: string;
  toastFeatured: string;
  toastOnScreen: string;
}

const PAGE = 48;
function filterToQuery(filter: string): string {
  if (filter === "all") return "";
  if (filter === "pending" || filter === "approved" || filter === "rejected") return `&status=${filter}`;
  if (filter === "VIE" || filter === "SÁB") return `&day=${encodeURIComponent(filter)}`;
  return `&stage=${encodeURIComponent(filter)}`;
}

export function AdminModeration({
  initial,
  initialHasMore,
  locale,
  filters,
  labels,
  stats,
}: {
  initial: Photo[];
  initialHasMore: boolean;
  locale: string;
  filters: ChipOption[];
  labels: ModerationViewLabels;
  stats?: { pending: number; uploadedToday: number; onScreen: number };
}) {
  const [queue, setQueue] = useState<Photo[]>(initial);
  const [filter, setFilter] = useState("all");
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; photo: Photo } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const offsetRef = useRef(initial.length);
  const sentinel = useRef<HTMLDivElement | null>(null);

  const visible = queue;

  async function changeFilter(f: string) {
    setFilter(f);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/photos?limit=${PAGE}&offset=0${filterToQuery(f)}`, { cache: "no-store" });
      const data = await res.json();
      setQueue(data.photos ?? []);
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
      const res = await fetch(`/api/admin/photos?limit=${PAGE}&offset=${offsetRef.current}${filterToQuery(filter)}`, { cache: "no-store" });
      const data = await res.json();
      const next: Photo[] = data.photos ?? [];
      setQueue((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        return [...prev, ...next.filter((p) => !seen.has(p.id))];
      });
      offsetRef.current += next.length;
      setHasMore(!!data.hasMore);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, filter]);

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const obs = new IntersectionObserver((e) => e[0].isIntersecting && loadMore(), { rootMargin: "500px" });
    obs.observe(el);
    return () => obs.disconnect();
  }, [loadMore]);

  function act(photo: Photo, kind: ActionKind) {
    // Optimista: la tarjeta sale de la cola y se persiste en la DB.
    setQueue((q) => q.filter((p) => p.id !== photo.id));
    const msg =
      kind === "approve"
        ? labels.toastApproved
        : kind === "reject"
          ? labels.toastRejected
          : kind === "feature"
            ? labels.toastFeatured
            : labels.toastOnScreen;
    setToast({ msg, photo });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 5000);

    // Persistencia real + rollback si falla.
    moderateAction(photo.id, kind).catch(() => {
      setQueue((q) => [photo, ...q]);
      setToast(null);
    });
  }

  function undo() {
    if (!toast) return;
    const photo = toast.photo;
    setQueue((q) => [photo, ...q]);
    setToast(null);
    void revertModerationAction(photo.id);
  }

  const pending = queue.filter((p) => p.status === "pending").length;

  return (
    <>
      {/* Stats (móvil compactas / escritorio en grid arriba via página) */}
      <div className="mb-4 grid grid-cols-3 gap-2 lg:hidden">
        <MiniStat value={String(stats?.pending ?? pending)} label={labels.pendingShort} tone="brand" />
        <MiniStat value={String(stats?.uploadedToday ?? 0)} label={labels.todayOk} tone="success" />
        <MiniStat value={String(stats?.onScreen ?? 0)} label={labels.onScreen} tone="white" />
      </div>

      <div className="mb-4">
        <FilterChips options={filters} value={filter} onChange={changeFilter} />
      </div>

      {visible.length === 0 ? (
        <p className="py-16 text-center font-body text-sm text-mist">
          {loading ? "Cargando…" : labels.queueEmpty}
        </p>
      ) : (
        <>
          {/* Escritorio: grid */}
          <div className="hidden gap-4 lg:grid lg:grid-cols-3">
            {visible.map((p) => (
              <ModerationCard
                key={p.id}
                photo={p}
                locale={locale}
                labels={labels}
                onApprove={() => act(p, "approve")}
                onReject={() => act(p, "reject")}
                onFeature={() => act(p, "feature")}
                onSendToScreen={() => act(p, "screen")}
              />
            ))}
          </div>

          {/* Móvil: swipe moderador */}
          <div className="lg:hidden">
            <SwipeModerator photos={visible} locale={locale} labels={labels} onAction={act} />
          </div>
        </>
      )}

      {/* Scroll infinito (solo escritorio; en móvil el swipe consume la cola) */}
      <div ref={sentinel} className="hidden h-8 lg:block" />
      {hasMore && (
        <button
          type="button"
          onClick={loadMore}
          disabled={loading}
          className="mx-auto mt-3 block rounded-pill border border-line px-5 py-2 font-mono text-xs uppercase tracking-wide text-mist lg:hidden"
        >
          {loading ? "Cargando…" : "Cargar más"}
        </button>
      )}

      {/* Toast deshacer */}
      {toast && (
        <div className="fixed inset-x-0 bottom-5 z-50 mx-auto flex w-full max-w-[420px] items-center justify-between rounded-sm border border-line bg-surface px-4 py-3 shadow-card">
          <span className="font-body text-[14px] text-white">{toast.msg}</span>
          <button
            type="button"
            onClick={undo}
            className="inline-flex items-center gap-1.5 font-mono text-[12px] font-bold uppercase text-brand"
          >
            <RotateCcw className="h-4 w-4" /> {labels.undo}
          </button>
        </div>
      )}
    </>
  );
}

function MiniStat({ value, label, tone }: { value: string; label: string; tone: "brand" | "success" | "white" }) {
  const color = tone === "brand" ? "text-brand" : tone === "success" ? "text-success" : "text-white";
  return (
    <div className="rounded-sm border border-line bg-surface px-3 py-2 text-center">
      <p className={cn("font-display text-[22px] font-bold leading-none", color)}>{value}</p>
      <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wide text-mist">{label}</p>
    </div>
  );
}

/** Tarjeta swipe: arrastrar derecha = aprobar, izquierda = rechazar. */
function SwipeModerator({
  photos,
  locale,
  labels,
  onAction,
}: {
  photos: Photo[];
  locale: string;
  labels: ModerationViewLabels;
  onAction: (p: Photo, k: ActionKind) => void;
}) {
  const current = photos[0];
  const [dx, setDx] = useState(0);
  const start = useRef<number | null>(null);

  if (!current) return null;

  function end() {
    if (Math.abs(dx) > 110) onAction(current, dx > 0 ? "approve" : "reject");
    setDx(0);
    start.current = null;
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        className="relative overflow-hidden rounded-[20px] border border-line bg-surface"
        style={{ transform: `translateX(${dx}px) rotate(${dx / 40}deg)`, transition: start.current ? "none" : "transform .25s" }}
        onPointerDown={(e) => {
          start.current = e.clientX;
          (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        }}
        onPointerMove={(e) => start.current !== null && setDx(e.clientX - start.current)}
        onPointerUp={end}
        onPointerCancel={end}
      >
        <div className="relative h-[420px]">
          <Image src={current.url} alt={current.stageName} fill sizes="480px" className="object-cover" priority />
          <div className="overlay-vert absolute inset-0" />
          <span className="absolute left-3 top-3 rounded-pill bg-black/60 px-2.5 py-1 font-mono text-[11px] font-bold text-white backdrop-blur">
            1 / {photos.length}
          </span>
          {dx > 40 && (
            <span className="absolute right-4 top-4 rounded-sm border-2 border-success px-3 py-1 font-display font-bold uppercase text-success">
              {labels.approve}
            </span>
          )}
          {dx < -40 && (
            <span className="absolute left-4 top-4 rounded-sm border-2 border-danger px-3 py-1 font-display font-bold uppercase text-danger">
              {labels.reject}
            </span>
          )}
          <div className="absolute inset-x-0 bottom-0 p-4">
            <p className="font-display text-[20px] font-bold text-white">
              {current.author?.name ?? current.author?.instagram ?? "Anónimo"}
            </p>
            <p className="font-mono text-[11px] uppercase tracking-wide text-brand">
              {current.stageName} · {dayLabel(current.day, locale)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <BigBtn onClick={() => onAction(current, "reject")} className="bg-danger/20 text-danger">
          <X className="h-5 w-5" /> {labels.reject}
        </BigBtn>
        <BigBtn onClick={() => onAction(current, "feature")} className="bg-surface-2 text-white">
          <Star className="h-5 w-5" /> {labels.feature}
        </BigBtn>
        <BigBtn onClick={() => onAction(current, "approve")} className="bg-success text-success-ink">
          <Check className="h-5 w-5" /> {labels.approve}
        </BigBtn>
        <BigBtn onClick={() => onAction(current, "screen")} className="bg-brand text-brand-ink">
          <MonitorPlay className="h-5 w-5" /> {labels.sendToScreen}
        </BigBtn>
      </div>
    </div>
  );
}

function BigBtn({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-14 items-center justify-center gap-2 rounded-sm font-display text-[15px] font-bold uppercase active:scale-95",
        className,
      )}
    >
      {children}
    </button>
  );
}
