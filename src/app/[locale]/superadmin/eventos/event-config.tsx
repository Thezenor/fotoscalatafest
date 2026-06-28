"use client";

import { useState, useTransition } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Save } from "lucide-react";
import { updateEventAction } from "@/server/actions/superadmin";
import { buttonClass } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export interface EventRow {
  id: string;
  slug: string;
  name: string;
  isActive: boolean;
  watermarkEnabled: boolean;
  watermarkPosition: string;
  watermarkOpacity: number;
  autoApproveOnAiClean: boolean;
  photos: number;
  stages: number;
  accessUrl: string;
}

export function EventConfig({ event }: { event: EventRow }) {
  const [form, setForm] = useState({
    isActive: event.isActive,
    watermarkEnabled: event.watermarkEnabled,
    watermarkPosition: event.watermarkPosition,
    watermarkOpacity: event.watermarkOpacity,
    autoApproveOnAiClean: event.autoApproveOnAiClean,
  });
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function save() {
    setSaved(false);
    startTransition(async () => {
      await updateEventAction(event.id, form);
      setSaved(true);
    });
  }

  const toggle = (k: keyof typeof form) => () =>
    setForm((f) => ({ ...f, [k]: !f[k] }));

  return (
    <div className="rounded-[16px] border border-line bg-surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-display text-xl font-bold text-white">{event.name}</h2>
          <p className="font-mono text-xs uppercase text-mist">
            {event.slug} · {event.photos} fotos · {event.stages} escenarios
          </p>
        </div>
        <Badge tone={form.isActive ? "success" : "neutral"}>
          {form.isActive ? "Activo" : "Inactivo"}
        </Badge>
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_auto]">
        <div className="flex flex-col gap-3">
          <Toggle label="Evento activo" checked={form.isActive} onChange={toggle("isActive")} />
          <Toggle label="Marca de agua" checked={form.watermarkEnabled} onChange={toggle("watermarkEnabled")} />
          <Toggle
            label="Auto-aprobar si IA limpia"
            checked={form.autoApproveOnAiClean}
            onChange={toggle("autoApproveOnAiClean")}
          />

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

          <div className="mt-2 flex items-center gap-3">
            <button type="button" onClick={save} disabled={pending} className={buttonClass({ size: "sm", className: "uppercase" })}>
              <Save className="h-4 w-4" /> Guardar
            </button>
            {saved && <span className="font-body text-sm text-success">Guardado ✓</span>}
          </div>
        </div>

        {/* QR de acceso */}
        <div className="flex flex-col items-center gap-2 rounded-md bg-white p-4">
          <QRCodeSVG value={event.accessUrl} size={120} fgColor="#0E0E0E" bgColor="#fff" />
          <p className="max-w-[160px] break-all text-center font-mono text-[9px] text-ink">
            {event.accessUrl}
          </p>
        </div>
      </div>
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="flex items-center justify-between gap-3 font-body text-sm text-white"
    >
      {label}
      <span
        className={`relative h-6 w-11 rounded-full transition ${checked ? "bg-brand" : "bg-surface-2 border border-line"}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${checked ? "left-[22px]" : "left-0.5"}`}
        />
      </span>
    </button>
  );
}
