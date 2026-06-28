"use client";

import { useState, useTransition } from "react";
import { Save } from "lucide-react";
import { saveEmailConfigAction } from "@/server/actions/superadmin";
import { buttonClass } from "@/components/ui/Button";

export interface EmailConfigDTO {
  enabled: boolean;
  provider: string;
  apiKey: string | null;
  fromEmail: string | null;
}

export function EmailConfig({ initial }: { initial: EmailConfigDTO }) {
  const [cfg, setCfg] = useState({
    enabled: initial.enabled,
    provider: initial.provider || "resend",
    apiKey: initial.apiKey ?? "",
    fromEmail: initial.fromEmail ?? "",
  });
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function save() {
    setSaved(false);
    startTransition(async () => {
      await saveEmailConfigAction({
        enabled: cfg.enabled,
        provider: cfg.provider,
        apiKey: cfg.apiKey || null,
        fromEmail: cfg.fromEmail || null,
      });
      setSaved(true);
    });
  }

  const ready = cfg.apiKey.trim() && cfg.fromEmail.trim();

  return (
    <div className="max-w-xl rounded-[16px] border border-line bg-surface p-5">
      <button
        type="button"
        onClick={() => setCfg((c) => ({ ...c, enabled: !c.enabled }))}
        className="flex w-full items-center justify-between gap-3 font-body text-sm text-white"
      >
        Enviar aviso cuando se aprueba una foto
        <span className={`relative h-6 w-11 rounded-full transition ${cfg.enabled ? "bg-brand" : "border border-line bg-surface-2"}`}>
          <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${cfg.enabled ? "left-[22px]" : "left-0.5"}`} />
        </span>
      </button>

      {cfg.enabled && !ready && (
        <p className="mt-2 rounded-sm border border-brand/40 bg-brand/10 px-3 py-2 font-body text-[12.5px] text-mist">
          Activado pero <strong className="text-white">incompleto</strong>: añade la API key y el remitente para que se envíen los correos.
        </p>
      )}

      <label className="mt-4 flex items-center justify-between gap-3 font-body text-sm text-white">
        Proveedor
        <select
          value={cfg.provider}
          onChange={(e) => setCfg((c) => ({ ...c, provider: e.target.value }))}
          className="rounded-sm border border-line bg-surface-2 px-2 py-1.5 text-sm"
        >
          <option value="resend">Resend</option>
        </select>
      </label>

      <label className="mt-4 flex flex-col gap-1 font-body text-sm text-white">
        API key
        <input
          type="password"
          value={cfg.apiKey}
          onChange={(e) => setCfg((c) => ({ ...c, apiKey: e.target.value }))}
          placeholder="re_..."
          className="rounded-sm border border-line bg-surface-2 px-3 py-2 font-mono text-sm text-white outline-none focus:border-brand"
        />
      </label>

      <label className="mt-4 flex flex-col gap-1 font-body text-sm text-white">
        Remitente (verificado en el proveedor)
        <input
          type="text"
          value={cfg.fromEmail}
          onChange={(e) => setCfg((c) => ({ ...c, fromEmail: e.target.value }))}
          placeholder="Calatafest Fotos <fotos@fotoscalatafest.com>"
          className="rounded-sm border border-line bg-surface-2 px-3 py-2 font-body text-sm text-white outline-none focus:border-brand"
        />
      </label>

      <div className="mt-5 flex items-center gap-3">
        <button type="button" onClick={save} disabled={pending} className={buttonClass({ size: "sm", className: "uppercase" })}>
          <Save className="h-4 w-4" /> Guardar
        </button>
        {saved && <span className="font-body text-sm text-success">Guardado ✓</span>}
      </div>

      <p className="mt-4 font-body text-[12.5px] text-mist">
        Con <strong className="text-white">Resend</strong>: crea una cuenta, verifica el dominio del remitente y pega la API key.
        El email se envía solo a quien lo dejó al subir su foto, una vez, al aprobarse.
      </p>
    </div>
  );
}
