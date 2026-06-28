"use client";

import { useState } from "react";
import { Input, Textarea } from "@/components/ui/Input";
import { buttonClass } from "@/components/ui/Button";

/**
 * Solicitud de retirada de foto (RGPD / personas identificables).
 * Formulario corto (email + motivo) → POST /api/photos/:id/removal (crea ticket).
 */
export function RemovalLink({ photoId, label }: { photoId: string; label: string }) {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(false);
  const [sending, setSending] = useState(false);

  if (sent) {
    return (
      <p className="text-center font-body text-[12px] text-mist">
        Solicitud registrada. La revisaremos lo antes posible.
      </p>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mx-auto block font-body text-[12px] text-mist-2 underline underline-offset-2"
      >
        {label}
      </button>
    );
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setError(false);
        setSending(true);
        const fd = new FormData(e.currentTarget);
        try {
          const res = await fetch(`/api/photos/${photoId}/removal`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: fd.get("email"), reason: fd.get("reason") }),
          });
          if (!res.ok) throw new Error();
          setSent(true);
        } catch {
          setError(true);
          setSending(false);
        }
      }}
      className="flex flex-col gap-2 rounded-md border border-line bg-surface p-4"
    >
      <Input name="email" type="email" required placeholder="Email de contacto" />
      <Textarea name="reason" required placeholder="Motivo de la solicitud" />
      {error && <p className="text-[12px] text-danger">No se pudo enviar. Inténtalo de nuevo.</p>}
      <button type="submit" disabled={sending} className={buttonClass({ size: "sm", className: "uppercase" })}>
        Enviar solicitud
      </button>
    </form>
  );
}
