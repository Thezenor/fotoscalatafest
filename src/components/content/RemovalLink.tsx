"use client";

import { useState } from "react";
import { Input, Textarea } from "@/components/ui/Input";
import { buttonClass } from "@/components/ui/Button";

/**
 * Solicitud de retirada de foto (RGPD / personas identificables).
 * Abre un formulario corto (motivo + email) → crea un ticket para el admin.
 * TODO(backend): POST /api/photos/:id/removal con { reason, email }.
 */
export function RemovalLink({ photoId, label }: { photoId: string; label: string }) {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);

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
      onSubmit={(e) => {
        e.preventDefault();
        void photoId; // TODO(backend): enviar ticket
        setSent(true);
      }}
      className="flex flex-col gap-2 rounded-md border border-line bg-surface p-4"
    >
      <Input type="email" required placeholder="Email de contacto" />
      <Textarea required placeholder="Motivo de la solicitud" />
      <button type="submit" className={buttonClass({ size: "sm", className: "uppercase" })}>
        Enviar solicitud
      </button>
    </form>
  );
}
