"use client";

import { useActionState } from "react";
import { Save } from "lucide-react";
import { updateAiAction, type AiState } from "@/server/actions/ai-settings";
import { Textarea } from "@/components/ui/Input";
import { buttonClass } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export function AiForm({
  enabled,
  hasCredentials,
  ready,
}: {
  enabled: boolean;
  hasCredentials: boolean;
  ready: boolean;
}) {
  const [state, action, pending] = useActionState<AiState, FormData>(updateAiAction, {});

  return (
    <form action={action} className="flex flex-col gap-6">
      <section className="rounded-[16px] border border-line bg-surface p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-white">Estado</h2>
          <Badge tone={ready ? "success" : "neutral"}>{ready ? "Activa" : "Inactiva"}</Badge>
        </div>
        <p className="mt-2 font-body text-sm text-mist">
          Si está inactiva, las fotos quedan PENDIENTES para moderación manual (seguro por defecto).
          Proveedor: Google Cloud Vision (SafeSearch + detección de rostros).
        </p>
        <label className="mt-4 flex items-center gap-3 font-body text-sm text-white">
          <input type="checkbox" name="enabled" defaultChecked={enabled} className="h-5 w-5 accent-[var(--brand)]" />
          Activar moderación automática con IA
        </label>
      </section>

      <section className="rounded-[16px] border border-line bg-surface p-5">
        <h2 className="font-display text-lg font-bold text-white">Credenciales (Google Vision)</h2>
        <p className="mt-1 font-body text-sm text-mist">
          Pega el JSON del <em>service account</em>. Estado actual:{" "}
          <span className={hasCredentials ? "text-success" : "text-mist-2"}>
            {hasCredentials ? "credenciales guardadas" : "sin credenciales"}
          </span>
          . Déjalo vacío para mantener las actuales.
        </p>
        <Textarea
          name="credentials"
          rows={8}
          placeholder='{"type":"service_account","project_id":"…","client_email":"…","private_key":"…"}'
          className="mt-3 min-h-[180px] font-mono text-xs"
        />
        {hasCredentials && (
          <label className="mt-3 flex items-center gap-2 font-body text-sm text-mist">
            <input type="checkbox" name="clear" className="h-4 w-4 accent-[var(--danger)]" />
            Borrar las credenciales guardadas
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
