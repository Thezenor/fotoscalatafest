"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/** Checkbox legal con área táctil ≥44px. Marcado = caja amarilla con ✓. */
export function LegalCheckbox({
  checked,
  onChange,
  children,
  name,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  children: React.ReactNode;
  name?: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 py-1.5">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <span
        className={cn(
          "mt-0.5 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[6px] border-[1.5px] transition",
          checked ? "border-brand bg-brand" : "border-[#555] bg-transparent",
        )}
      >
        {checked && <Check className="h-3.5 w-3.5 text-brand-ink" strokeWidth={3.5} />}
      </span>
      <span className="font-body text-[13px] leading-[1.35] text-[#C8C8C8]">
        {children}
      </span>
    </label>
  );
}
