"use client";

import { cn } from "@/lib/utils";

export interface ChipOption {
  value: string;
  label: string;
}

/** Fila de chips con scroll horizontal. Activo = amarillo. */
export function FilterChips({
  options,
  value,
  onChange,
}: {
  options: ChipOption[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "shrink-0 rounded-pill border px-4 py-2 font-mono text-[12px] font-semibold uppercase tracking-wide transition",
              active
                ? "border-brand bg-brand text-brand-ink"
                : "border-line bg-transparent text-[#cfcfcf] hover:border-white/40",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
