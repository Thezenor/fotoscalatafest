"use client";

import { cn } from "@/lib/utils";

export interface SegmentOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

/** Tabs segmentadas (Cámara/Galería). Activa = amarillo sobre negro. */
export function SegmentedTabs({
  options,
  value,
  onChange,
}: {
  options: SegmentOption[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex gap-1 rounded-sm bg-surface-2 p-1">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex h-11 flex-1 items-center justify-center gap-2 rounded-[11px] font-body text-[14px] font-semibold transition",
              active ? "bg-brand text-brand-ink" : "text-mist hover:text-white",
            )}
          >
            {opt.icon}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
