"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Save, Tv, ExternalLink, Copy, Check } from "lucide-react";
import { saveTvConfigAction } from "@/server/actions/superadmin";
import { TV_TEMPLATES, type LiveVariant } from "@/components/live/templates";
import { buttonClass } from "@/components/ui/Button";

export interface TvConfigDTO {
  template: string;
  intervalMs: number;
  showSponsors: boolean;
  showQr: boolean;
}

export function TvConfig({ initial, locale, siteUrl }: { initial: TvConfigDTO; locale: string; siteUrl: string }) {
  const [cfg, setCfg] = useState<TvConfigDTO>(initial);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  // El preview se renderiza a tamaño TV (1280×720) y se escala para encajar
  // en la caja 16:9 → las proporciones son las de una pantalla real, no desbordan.
  const boxRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.42);
  useEffect(() => {
    const el = boxRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const apply = () => setScale(el.clientWidth / 1280);
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // URL absoluta de la pantalla (para abrir/compartir) y relativa (para el iframe de preview).
  const livePath = `/${locale}/live?variant=${cfg.template}&interval=${cfg.intervalMs}`;
  const liveAbsolute = `${siteUrl}${livePath}`;
  // El preview se refresca cuando cambian plantilla/intervalo/toggles (key del iframe).
  const previewKey = useMemo(
    () => `${cfg.template}-${cfg.intervalMs}-${cfg.showSponsors}-${cfg.showQr}`,
    [cfg],
  );

  function save() {
    setSaved(false);
    startTransition(async () => {
      await saveTvConfigAction({ ...cfg, template: cfg.template as LiveVariant });
      setSaved(true);
    });
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(liveAbsolute);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
      {/* Columna de configuración */}
      <div className="flex flex-col gap-5">
        <div>
          <p className="mb-2 font-mono text-xs uppercase tracking-wide text-mist">Plantilla</p>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {TV_TEMPLATES.map((tpl) => {
              const active = cfg.template === tpl.key;
              return (
                <button
                  key={tpl.key}
                  type="button"
                  onClick={() => setCfg((c) => ({ ...c, template: tpl.key }))}
                  className={`flex flex-col gap-1 rounded-[14px] border p-3.5 text-left transition ${
                    active ? "border-brand bg-brand/10" : "border-line bg-surface hover:border-brand/50"
                  }`}
                >
                  <span className="flex items-center gap-2 font-display text-[15px] font-bold text-white">
                    <Tv className={`h-4 w-4 ${active ? "text-brand" : "text-mist"}`} /> {tpl.label}
                  </span>
                  <span className="font-body text-[12.5px] leading-snug text-mist">{tpl.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        <label className="flex flex-col gap-1 font-body text-sm text-white">
          Cadencia de rotación: <strong>{(cfg.intervalMs / 1000).toFixed(1)} s</strong>
          <input
            type="range"
            min={2000}
            max={12000}
            step={500}
            value={cfg.intervalMs}
            onChange={(e) => setCfg((c) => ({ ...c, intervalMs: Number(e.target.value) }))}
            className="w-full accent-[var(--brand)]"
          />
        </label>

        <Toggle label="Mostrar patrocinadores" checked={cfg.showSponsors} onChange={() => setCfg((c) => ({ ...c, showSponsors: !c.showSponsors }))} />
        <Toggle label="Mostrar QR «sube tu foto»" checked={cfg.showQr} onChange={() => setCfg((c) => ({ ...c, showQr: !c.showQr }))} />

        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={save} disabled={pending} className={buttonClass({ size: "sm", className: "uppercase" })}>
            <Save className="h-4 w-4" /> Guardar
          </button>
          {saved && <span className="font-body text-sm text-success">Guardado ✓</span>}
        </div>

        {/* Enlace de la pantalla */}
        <div className="rounded-md border border-line bg-surface p-4">
          <p className="font-mono text-xs uppercase tracking-wide text-mist">Enlace de la pantalla</p>
          <p className="mt-1 break-all font-mono text-[12px] text-white">{liveAbsolute}</p>
          <div className="mt-3 flex gap-2.5">
            <a href={livePath} target="_blank" rel="noopener noreferrer" className={buttonClass({ size: "sm", className: "uppercase" })}>
              <ExternalLink className="h-4 w-4" /> Abrir pantalla
            </a>
            <button type="button" onClick={copyLink} className={buttonClass({ variant: "secondary", size: "sm", className: "uppercase" })}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? "Copiado" : "Copiar"}
            </button>
          </div>
          <p className="mt-2 font-body text-[12px] text-mist">
            Guardar fija esta plantilla como predeterminada; <code>/live</code> la usará sin parámetros.
          </p>
        </div>
      </div>

      {/* Columna de previsualización en vivo */}
      <div className="flex flex-col gap-2">
        <p className="font-mono text-xs uppercase tracking-wide text-mist">Previsualización en directo (16:9)</p>
        <div ref={boxRef} className="relative aspect-video w-full overflow-hidden rounded-md border border-line bg-ink-pure">
          <iframe
            key={previewKey}
            src={livePath}
            title="Previsualización TV"
            tabIndex={-1}
            style={{
              width: 1280,
              height: 720,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
            className="absolute left-0 top-0 border-0"
          />
        </div>
        <p className="font-body text-[12px] text-mist">
          La previsualización muestra fotos reales aprobadas y rota automáticamente.
        </p>
      </div>
    </div>
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
