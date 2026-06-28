"use client";

import { useActionState } from "react";
import { Save } from "lucide-react";
import { updateTemplatesAction, type StoreState } from "@/server/actions/store";
import { Input } from "@/components/ui/Input";
import { buttonClass } from "@/components/ui/Button";
import type { TemplateConfig } from "@/server/services/settings.service";

const POSITIONS = [
  ["bottom-right", "Abajo derecha"],
  ["bottom-left", "Abajo izquierda"],
  ["top-right", "Arriba derecha"],
  ["top-left", "Arriba izquierda"],
  ["center", "Centro"],
] as const;

function TplFields({ prefix, title, tpl }: { prefix: string; title: string; tpl: TemplateConfig }) {
  return (
    <section className="rounded-[16px] border border-line bg-surface p-5">
      <h2 className="font-display text-lg font-bold text-white">{title}</h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <label className="flex items-center gap-3 font-body text-sm text-white sm:col-span-2">
          <input type="checkbox" name={`${prefix}_showSponsorLogo`} defaultChecked={tpl.showSponsorLogo} className="h-5 w-5 accent-[var(--brand)]" />
          Mostrar logo del patrocinador
        </label>
        <label className="flex flex-col gap-1 font-body text-sm text-white">
          Posición del logo
          <select name={`${prefix}_logoPosition`} defaultValue={tpl.logoPosition} className="h-[44px] rounded-sm border border-line bg-surface-2 px-2 text-sm">
            {POSITIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 font-body text-sm text-white">
          Tamaño del logo (% ancho)
          <Input name={`${prefix}_logoScalePct`} type="number" min={5} max={60} defaultValue={tpl.logoScalePct} className="max-w-[120px]" />
        </label>
        <label className="flex flex-col gap-1 font-body text-sm text-white">
          Color del marco (hex, vacío = sin marco)
          <Input name={`${prefix}_frameColor`} defaultValue={tpl.frameColor ?? ""} placeholder="#F9B41A" className="max-w-[160px]" />
        </label>
        <label className="flex flex-col gap-1 font-body text-sm text-white">
          Grosor del marco (px)
          <Input name={`${prefix}_framePx`} type="number" min={0} max={120} defaultValue={tpl.framePx} className="max-w-[120px]" />
        </label>
      </div>
    </section>
  );
}

export function PlantillasForm({ vertical, horizontal }: { vertical: TemplateConfig; horizontal: TemplateConfig }) {
  const [state, action, pending] = useActionState<StoreState, FormData>(updateTemplatesAction, {});
  return (
    <form action={action} className="flex flex-col gap-6">
      <p className="font-body text-sm text-mist">
        La plantilla se aplica según la orientación de la foto (se detecta automáticamente).
        Se usa en la descarga de alta calidad y en la impresión (que además añade número + QR).
      </p>
      <TplFields prefix="v" title="Plantilla vertical (retrato)" tpl={vertical} />
      <TplFields prefix="h" title="Plantilla horizontal (paisaje)" tpl={horizontal} />
      {state.error && <p className="text-sm text-danger">{state.error}</p>}
      {state.ok && <p className="text-sm text-success">Guardado ✓</p>}
      <button type="submit" disabled={pending} className={buttonClass({ size: "md", className: "uppercase self-start" })}>
        <Save className="h-5 w-5" /> Guardar plantillas
      </button>
    </form>
  );
}
