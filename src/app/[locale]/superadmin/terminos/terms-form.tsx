"use client";

import { useActionState } from "react";
import { Save } from "lucide-react";
import { updateTermsAction, type TermsState } from "@/server/actions/terms";
import { Input, Textarea } from "@/components/ui/Input";
import { buttonClass } from "@/components/ui/Button";

export function TermsForm({ version, content }: { version: string; content: string }) {
  const [state, action, pending] = useActionState<TermsState, FormData>(updateTermsAction, {});

  return (
    <form action={action} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 font-body text-sm text-white">
        Versión (se guarda en cada consentimiento)
        <Input name="version" defaultValue={version} className="max-w-[220px]" />
      </label>
      <label className="flex flex-col gap-1 font-body text-sm text-white">
        Contenido (texto / markdown sencillo)
        <Textarea name="content" defaultValue={content} rows={22} className="min-h-[460px] font-mono text-xs leading-relaxed" />
      </label>

      {state.error && <p className="text-sm text-danger">{state.error}</p>}
      {state.ok && <p className="text-sm text-success">Guardado ✓</p>}

      <button type="submit" disabled={pending} className={buttonClass({ size: "md", className: "uppercase self-start" })}>
        <Save className="h-5 w-5" /> Guardar términos
      </button>
    </form>
  );
}
