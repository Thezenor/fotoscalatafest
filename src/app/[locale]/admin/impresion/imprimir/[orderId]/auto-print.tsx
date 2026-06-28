"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Printer, Check, ArrowLeft } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { fulfillPrintAction } from "@/server/actions/moderation";
import { buttonClass } from "@/components/ui/Button";

/**
 * Vista de impresión rápida: muestra la copia en alta calidad y lanza el diálogo
 * de impresión automáticamente al cargar la imagen. Solo la foto se imprime
 * (el resto se oculta en @media print). Botón grande para marcar impresa.
 */
export function AutoPrintView({
  imageUrl,
  orderId,
  code,
}: {
  imageUrl: string;
  orderId: string;
  code: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [done, setDone] = useState(false);
  const printed = useRef(false);

  function print() {
    window.print();
  }

  function onImgLoad() {
    if (printed.current) return;
    printed.current = true;
    // Pequeño margen para asegurar el render antes del diálogo.
    setTimeout(() => window.print(), 300);
  }

  // Por si la imagen viene de caché y no dispara onLoad.
  useEffect(() => {
    const t = setTimeout(() => {
      if (!printed.current) {
        printed.current = true;
        window.print();
      }
    }, 1500);
    return () => clearTimeout(t);
  }, []);

  function markFulfilled() {
    start(() =>
      fulfillPrintAction(orderId).then(() => {
        setDone(true);
        router.push("/admin/impresion");
      }),
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center gap-5 px-5 py-6">
      {/* Controles (ocultos al imprimir) */}
      <div className="flex w-full items-center justify-between print:hidden">
        <button
          type="button"
          onClick={() => router.push("/admin/impresion")}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <span className="font-display text-2xl font-bold text-brand">#{code}</span>
        <div className="w-10" />
      </div>

      {/* Imagen a imprimir */}
      <div id="printable" className="w-full overflow-hidden rounded-lg border border-line print:rounded-none print:border-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt={`Copia ${code}`} onLoad={onImgLoad} className="h-auto w-full" />
      </div>

      {/* Acciones (ocultas al imprimir) */}
      <div className="flex w-full flex-col gap-3 sm:flex-row print:hidden">
        <button type="button" onClick={print} className={buttonClass({ variant: "secondary", size: "md", className: "flex-1 uppercase" })}>
          <Printer className="h-5 w-5" /> Reimprimir
        </button>
        <button type="button" onClick={markFulfilled} disabled={pending || done} className={buttonClass({ variant: "success", size: "md", className: "flex-1 uppercase" })}>
          <Check className="h-5 w-5" /> {done ? "Impresa ✓" : "Marcar impresa"}
        </button>
      </div>

      {/* Reglas de impresión: solo la foto, a página completa, sin márgenes. */}
      <style>{`
        @page { size: auto; margin: 0; }
        @media print {
          body * { visibility: hidden !important; }
          #printable, #printable * { visibility: visible !important; }
          #printable { position: fixed; inset: 0; width: 100%; height: 100%; }
          #printable img { width: 100%; height: 100%; object-fit: contain; }
        }
      `}</style>
    </main>
  );
}
