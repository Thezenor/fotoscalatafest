"use client";

import { useActionState, useTransition } from "react";
import { Upload, RotateCcw } from "lucide-react";
import { updateBrandingAction, resetBrandLogoAction, type BrandingState } from "@/server/actions/branding";
import { Textarea } from "@/components/ui/Input";
import { buttonClass } from "@/components/ui/Button";

export function BrandingForm({
  showWordmark,
  sponsors,
}: {
  showWordmark: boolean;
  sponsors: string[];
}) {
  const [state, action, pending] = useActionState<BrandingState, FormData>(
    updateBrandingAction,
    {},
  );
  const [resetting, startReset] = useTransition();

  return (
    <form action={action} className="flex flex-col gap-6">
      {/* Logo */}
      <section className="rounded-[16px] border border-line bg-surface p-5">
        <h2 className="font-display text-lg font-bold text-white">Logo</h2>
        <p className="mt-1 font-body text-sm text-mist">
          PNG, WebP o JPG (máx 4 MB). Se usa en toda la web y como marca de agua.
        </p>
        <div className="mt-4 flex items-center gap-4">
          <span className="flex h-16 w-16 items-center justify-center rounded-md border border-line bg-ink p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/api/brand/logo" alt="logo actual" style={{ maxHeight: 48, maxWidth: 48 }} />
          </span>
          <input
            type="file"
            name="logo"
            accept="image/png,image/webp,image/jpeg"
            className="block w-full text-sm text-mist file:mr-3 file:rounded-pill file:border-0 file:bg-surface-2 file:px-4 file:py-2 file:font-body file:text-white"
          />
        </div>
        <button
          type="button"
          disabled={resetting}
          onClick={() => startReset(() => resetBrandLogoAction())}
          className="mt-3 inline-flex items-center gap-1.5 font-body text-xs text-mist underline"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Restaurar mascota por defecto
        </button>
      </section>

      {/* Opciones */}
      <section className="rounded-[16px] border border-line bg-surface p-5">
        <label className="flex items-center gap-3 font-body text-sm text-white">
          <input type="checkbox" name="showWordmark" defaultChecked={showWordmark} className="h-5 w-5 accent-[var(--brand)]" />
          Mostrar el texto “CALATAFEST” junto al logo
        </label>
      </section>

      {/* Patrocinadores */}
      <section className="rounded-[16px] border border-line bg-surface p-5">
        <h2 className="font-display text-lg font-bold text-white">Patrocinadores</h2>
        <p className="mt-1 font-body text-sm text-mist">Un nombre por línea.</p>
        <Textarea
          name="sponsors"
          defaultValue={sponsors.join("\n")}
          rows={6}
          className="mt-3 min-h-[140px]"
        />
      </section>

      {state.error && <p className="text-sm text-danger">{state.error}</p>}
      {state.ok && <p className="text-sm text-success">Guardado ✓</p>}

      <button type="submit" disabled={pending} className={buttonClass({ size: "md", className: "uppercase self-start" })}>
        <Upload className="h-5 w-5" /> Guardar marca
      </button>
    </form>
  );
}
