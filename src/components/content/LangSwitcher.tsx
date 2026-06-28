"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";

const LABELS: Record<string, string> = { es: "ES", en: "EN", ca: "CA" };

/** Selector de idioma (pill). Cambia el locale conservando la ruta actual. */
export function LangSwitcher({ tone = "translucent" }: { tone?: "translucent" | "solid" }) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "inline-flex items-center gap-1 rounded-pill px-3 py-1.5 font-mono text-[12px] font-semibold uppercase text-white",
          tone === "translucent" ? "border border-white/35" : "border border-line bg-surface-2",
        )}
      >
        {LABELS[locale] ?? locale.toUpperCase()}
        <ChevronDown className="h-3.5 w-3.5" />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 min-w-[88px] overflow-hidden rounded-sm border border-line bg-surface shadow-card">
          {routing.locales.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => {
                setOpen(false);
                router.replace(pathname, { locale: l });
              }}
              className={cn(
                "block w-full px-4 py-2 text-left font-mono text-[12px] uppercase",
                l === locale ? "bg-brand text-brand-ink" : "text-white hover:bg-surface-2",
              )}
            >
              {LABELS[l] ?? l.toUpperCase()}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
