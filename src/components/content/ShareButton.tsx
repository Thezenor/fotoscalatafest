"use client";

import { Share2 } from "lucide-react";
import { buttonClass } from "@/components/ui/Button";

/** Botón de compartir nativo (Web Share API) con fallback a copiar enlace. */
export function ShareButton({
  label,
  url,
  title,
  variant = "secondary",
}: {
  label: string;
  url?: string;
  title?: string;
  variant?: "secondary" | "primary";
}) {
  async function share() {
    const shareUrl = url ?? (typeof window !== "undefined" ? window.location.href : "");
    try {
      if (navigator.share) {
        await navigator.share({ title: title ?? "Calatafest Fotos", url: shareUrl });
      } else {
        await navigator.clipboard.writeText(shareUrl);
      }
    } catch {
      /* cancelado por el usuario */
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      className={buttonClass({ variant, size: "md", className: "uppercase" })}
    >
      <Share2 className="h-5 w-5" /> {label}
    </button>
  );
}
