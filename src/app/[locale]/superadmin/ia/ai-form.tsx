"use client";

import { useActionState, useState } from "react";
import { Save } from "lucide-react";
import { updateAiAction, type AiState } from "@/server/actions/ai-settings";
import { Textarea } from "@/components/ui/Input";
import { buttonClass } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export interface ProviderInfo {
  id: string;
  label: string;
  implemented: boolean;
  keyLabel: string;
  hasKey: boolean;
}

export function AiForm({
  enabled,
  provider,
  providers,
  ready,
}: {
  enabled: boolean;
  provider: string;
  providers: ProviderInfo[];
  ready: boolean;
}) {
  const [state, action, pending] = useActionState<AiState, FormData>(updateAiAction, {});
  const [sel, setSel] = useState(provider);
  const current = providers.find((p) => p.id === sel);

  return (
    <form action={action} className="flex flex-col gap-6">
      <section className="rounded-[16px] border border-line bg-surface p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-white">Estado</h2>
          <Badge tone={ready ? "success" : "neutral"}>{ready ? "Activa" : "Inactiva"}</Badge>
        </div>
        <p className="mt-2 font-body text-sm text-mist">
          Si está inactiva o el proveedor no tiene clave, las fotos quedan PENDIENTES (revisión manual, seguro por defecto).
        </p>
        <label className="mt-4 flex items-center gap-3 font-body text-sm text-white">
          <input type="checkbox" name="enabled" defaultChecked={enabled} className="h-5 w-5 accent-[var(--brand)]" />
          Activar moderación automática con IA
        </label>
      </section>

      <section className="rounded-[16px] border border-line bg-surface p-5">
        <h2 className="font-display text-lg font-bold text-white">Proveedor de IA</h2>
        <select
          name="provider"
          value={sel}
          onChange={(e) => setSel(e.target.value)}
          className="mt-3 h-[50px] w-full rounded-sm border border-line bg-surface-2 px-3 font-body text-[15px] text-white outline-none focus:border-brand"
        >
          {providers.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label} {p.hasKey ? "· (clave guardada)" : ""}
            </option>
          ))}
        </select>
        {current && !current.implemented && (
          <p className="mt-2 font-body text-xs text-mist-2">
            Este proveedor está <strong>preparado</strong> pero aún no integrado: guardar su clave no activará la IA todavía.
          </p>
        )}

        <p className="mt-4 font-body text-sm text-mist">
          Clave / credenciales para <strong className="text-white">{current?.label}</strong> ({current?.keyLabel}).
          Estado: {current?.hasKey ? <span className="text-success">guardada</span> : <span className="text-mist-2">sin clave</span>}.
          Déjalo vacío para mantener la actual.
        </p>
        <Textarea
          name="credentials"
          rows={7}
          placeholder={current?.keyLabel}
          className="mt-3 min-h-[150px] font-mono text-xs"
        />
        {current?.hasKey && (
          <label className="mt-3 flex items-center gap-2 font-body text-sm text-mist">
            <input type="checkbox" name="clear" className="h-4 w-4 accent-[var(--danger)]" />
            Borrar la clave guardada de este proveedor
          </label>
        )}
      </section>

      {state.error && <p className="text-sm text-danger">{state.error}</p>}
      {state.ok && <p className="text-sm text-success">Guardado ✓</p>}

      <button type="submit" disabled={pending} className={buttonClass({ size: "md", className: "uppercase self-start" })}>
        <Save className="h-5 w-5" /> Guardar IA
      </button>
    </form>
  );
}
