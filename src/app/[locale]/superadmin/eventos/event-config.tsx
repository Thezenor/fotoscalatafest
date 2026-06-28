"use client";

import { useState, useTransition } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Save, Plus, Trash2, ImageDown } from "lucide-react";
import {
  updateEventAction,
  createStageAction,
  updateStageAction,
  deleteStageAction,
} from "@/server/actions/superadmin";
import { buttonClass } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export interface StagePhotoOption {
  id: string;
  printCode: string | null;
  url: string;
  author: string | null;
}

export interface StageRow {
  id: string;
  name: string;
  sub: string | null;
  dayLabel: string | null;
  bannerUrl: string | null;
  photos: number;
  options: StagePhotoOption[];
}

export interface EventRow {
  id: string;
  slug: string;
  name: string;
  isActive: boolean;
  watermarkEnabled: boolean;
  watermarkPosition: string;
  watermarkOpacity: number;
  autoApproveOnAiClean: boolean;
  downloadMode: string;
  sponsors: string[];
  photos: number;
  stages: StageRow[];
  accessUrl: string;
}

export function EventConfig({ event }: { event: EventRow }) {
  const [form, setForm] = useState({
    isActive: event.isActive,
    watermarkEnabled: event.watermarkEnabled,
    watermarkPosition: event.watermarkPosition,
    watermarkOpacity: event.watermarkOpacity,
    autoApproveOnAiClean: event.autoApproveOnAiClean,
    downloadMode: event.downloadMode,
  });
  const [sponsors, setSponsors] = useState(event.sponsors.join("\n"));
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function save() {
    setSaved(false);
    startTransition(async () => {
      await updateEventAction(event.id, {
        ...form,
        sponsors: sponsors.split("\n").map((s) => s.trim()).filter(Boolean),
      });
      setSaved(true);
    });
  }

  const toggle = (k: "isActive" | "watermarkEnabled" | "autoApproveOnAiClean") => () =>
    setForm((f) => ({ ...f, [k]: !f[k] }));

  return (
    <div className="rounded-[16px] border border-line bg-surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-display text-xl font-bold text-white">{event.name}</h2>
          <p className="font-mono text-xs uppercase text-mist">
            {event.slug} · {event.photos} fotos · {event.stages.length} escenarios
          </p>
        </div>
        <Badge tone={form.isActive ? "success" : "neutral"}>{form.isActive ? "Activo" : "Inactivo"}</Badge>
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_auto]">
        <div className="flex flex-col gap-3">
          <Toggle label="Evento activo" checked={form.isActive} onChange={toggle("isActive")} />
          <Toggle label="Marca de agua" checked={form.watermarkEnabled} onChange={toggle("watermarkEnabled")} />
          <Toggle label="Auto-aprobar si IA limpia" checked={form.autoApproveOnAiClean} onChange={toggle("autoApproveOnAiClean")} />

          {/* Modo de descarga */}
          <div className="rounded-md border border-line bg-surface-2/40 p-3">
            <p className="font-body text-sm font-semibold text-white">Descarga de fotos</p>
            <p className="mb-2 font-body text-[12px] text-mist">
              Define qué ve el público en cada foto de este evento.
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              <ModeCard
                active={form.downloadMode === "free"}
                onClick={() => setForm((f) => ({ ...f, downloadMode: "free" }))}
                title="Descarga gratis"
                desc="Aparece el botón de descarga."
              />
              <ModeCard
                active={form.downloadMode === "paid"}
                onClick={() => setForm((f) => ({ ...f, downloadMode: "paid" }))}
                title="Solo pago"
                desc="Sin descarga; se muestra el código para localizar e imprimir."
              />
            </div>
          </div>

          <label className="flex items-center justify-between gap-3 font-body text-sm text-white">
            Posición marca de agua
            <select
              value={form.watermarkPosition}
              onChange={(e) => setForm((f) => ({ ...f, watermarkPosition: e.target.value }))}
              className="rounded-sm border border-line bg-surface-2 px-2 py-1.5 text-sm"
            >
              <option value="bottom-right">Abajo derecha</option>
              <option value="bottom-left">Abajo izquierda</option>
              <option value="top-right">Arriba derecha</option>
              <option value="top-left">Arriba izquierda</option>
              <option value="center">Centro</option>
            </select>
          </label>

          <label className="flex items-center justify-between gap-3 font-body text-sm text-white">
            Opacidad ({form.watermarkOpacity.toFixed(2)})
            <input
              type="range"
              min={0.1}
              max={1}
              step={0.05}
              value={form.watermarkOpacity}
              onChange={(e) => setForm((f) => ({ ...f, watermarkOpacity: Number(e.target.value) }))}
              className="w-40 accent-[var(--brand)]"
            />
          </label>

          <label className="flex flex-col gap-1 font-body text-sm text-white">
            Patrocinadores del evento (uno por línea; vacío = usa los globales)
            <textarea
              value={sponsors}
              onChange={(e) => setSponsors(e.target.value)}
              rows={3}
              className="rounded-sm border border-line bg-surface-2 px-3 py-2 font-body text-sm text-white outline-none focus:border-brand"
            />
          </label>

          <div className="mt-2 flex items-center gap-3">
            <button type="button" onClick={save} disabled={pending} className={buttonClass({ size: "sm", className: "uppercase" })}>
              <Save className="h-4 w-4" /> Guardar
            </button>
            {saved && <span className="font-body text-sm text-success">Guardado ✓</span>}
          </div>
        </div>

        {/* QR de acceso */}
        <div className="flex h-fit flex-col items-center gap-2 rounded-md bg-white p-4">
          <QRCodeSVG value={event.accessUrl} size={120} fgColor="#0E0E0E" bgColor="#fff" />
          <p className="max-w-[160px] break-all text-center font-mono text-[9px] text-ink">{event.accessUrl}</p>
        </div>
      </div>

      <StagesManager eventId={event.id} stages={event.stages} />
    </div>
  );
}

// ─────────────────────────── Escenarios ───────────────────────────

function StagesManager({ eventId, stages }: { eventId: string; stages: StageRow[] }) {
  const [pending, startTransition] = useTransition();
  const [draft, setDraft] = useState({ name: "", sub: "", dayLabel: "" });
  const [err, setErr] = useState<string | null>(null);

  function add() {
    setErr(null);
    if (!draft.name.trim()) {
      setErr("Pon un nombre.");
      return;
    }
    startTransition(async () => {
      const r = await createStageAction(eventId, draft);
      if (r?.error) setErr(r.error);
      else setDraft({ name: "", sub: "", dayLabel: "" });
    });
  }

  return (
    <div className="mt-6 border-t border-line pt-5">
      <h3 className="font-display text-lg font-bold text-white">Escenarios</h3>
      <p className="mb-3 font-body text-[13px] text-mist">
        Crea los escenarios y elige la foto que se muestra en público para cada uno.
      </p>

      <div className="flex flex-col gap-3">
        {stages.map((s) => (
          <StageItem key={s.id} stage={s} />
        ))}
        {stages.length === 0 && <p className="font-body text-sm text-mist">Aún no hay escenarios.</p>}
      </div>

      {/* Nuevo escenario */}
      <div className="mt-4 grid gap-2 sm:grid-cols-[1.4fr_1.4fr_1fr_auto]">
        <input
          value={draft.name}
          onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
          placeholder="Nombre (p.ej. Escenario Principal)"
          className="rounded-sm border border-line bg-surface-2 px-3 py-2 text-sm text-white outline-none focus:border-brand"
        />
        <input
          value={draft.sub}
          onChange={(e) => setDraft((d) => ({ ...d, sub: e.target.value }))}
          placeholder="Subtítulo (HEADLINERS)"
          className="rounded-sm border border-line bg-surface-2 px-3 py-2 text-sm text-white outline-none focus:border-brand"
        />
        <input
          value={draft.dayLabel}
          onChange={(e) => setDraft((d) => ({ ...d, dayLabel: e.target.value }))}
          placeholder="Día (VIE · SÁB)"
          className="rounded-sm border border-line bg-surface-2 px-3 py-2 text-sm text-white outline-none focus:border-brand"
        />
        <button type="button" onClick={add} disabled={pending} className={buttonClass({ size: "sm", className: "uppercase" })}>
          <Plus className="h-4 w-4" /> Añadir
        </button>
      </div>
      {err && <p className="mt-2 font-body text-sm text-danger">{err}</p>}
    </div>
  );
}

function StageItem({ stage }: { stage: StageRow }) {
  const [pending, startTransition] = useTransition();
  const [bannerUrl, setBannerUrl] = useState(stage.bannerUrl);

  function setBanner(url: string | null) {
    setBannerUrl(url);
    startTransition(async () => {
      await updateStageAction(stage.id, { bannerUrl: url });
    });
  }

  function remove() {
    if (!confirm(`¿Eliminar el escenario "${stage.name}"? Las fotos no se borran.`)) return;
    startTransition(async () => {
      await deleteStageAction(stage.id);
    });
  }

  return (
    <div className="flex flex-col gap-3 rounded-md border border-line bg-surface-2/40 p-3 sm:flex-row sm:items-center">
      <div
        className="h-16 w-24 shrink-0 rounded-sm border border-line bg-cover bg-center"
        style={bannerUrl ? { backgroundImage: `url(${bannerUrl})` } : undefined}
      >
        {!bannerUrl && (
          <div className="flex h-full w-full items-center justify-center font-mono text-[10px] text-mist">sin foto</div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-body text-sm font-semibold text-white">{stage.name}</p>
        <p className="font-mono text-[11px] uppercase text-brand">
          {[stage.sub, stage.dayLabel].filter(Boolean).join(" · ") || "—"} · {stage.photos} fotos
        </p>
      </div>

      {/* Selección de foto pública */}
      <label className="flex items-center gap-2 font-body text-[12px] text-mist">
        <ImageDown className="h-4 w-4 text-mist" />
        <select
          value={bannerUrl ?? ""}
          onChange={(e) => setBanner(e.target.value || null)}
          disabled={pending || stage.options.length === 0}
          className="max-w-[200px] rounded-sm border border-line bg-surface-2 px-2 py-1.5 text-[12px] text-white"
        >
          <option value="">— Sin foto pública —</option>
          {stage.options.map((o) => (
            <option key={o.id} value={o.url}>
              #{o.printCode ?? "??????"} {o.author ? `· ${o.author}` : ""}
            </option>
          ))}
        </select>
      </label>

      <button
        type="button"
        onClick={remove}
        disabled={pending}
        className="flex h-9 w-9 items-center justify-center rounded-sm border border-line text-danger hover:border-danger"
        aria-label="Eliminar escenario"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

// ─────────────────────────── UI helpers ───────────────────────────

function ModeCard({ active, onClick, title, desc }: { active: boolean; onClick: () => void; title: string; desc: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-sm border p-2.5 text-left transition ${
        active ? "border-brand bg-brand/10" : "border-line bg-surface hover:border-brand/50"
      }`}
    >
      <span className="font-body text-[13px] font-semibold text-white">{title}</span>
      <span className="mt-0.5 block font-body text-[11.5px] leading-snug text-mist">{desc}</span>
    </button>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <button type="button" onClick={onChange} className="flex items-center justify-between gap-3 font-body text-sm text-white">
      {label}
      <span className={`relative h-6 w-11 rounded-full transition ${checked ? "bg-brand" : "border border-line bg-surface-2"}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${checked ? "left-[22px]" : "left-0.5"}`} />
      </span>
    </button>
  );
}
