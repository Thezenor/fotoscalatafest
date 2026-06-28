import { cn } from "@/lib/utils";

type Tone = "brand" | "success" | "white";

const toneColor: Record<Tone, string> = {
  brand: "text-brand",
  success: "text-success",
  white: "text-white",
};

export function StatCard({
  label,
  value,
  tone = "white",
}: {
  label: string;
  value: string;
  tone?: Tone;
}) {
  return (
    <div className="rounded-[16px] border border-line bg-surface p-4">
      <p className="font-mono text-[12px] uppercase tracking-wide text-mist">{label}</p>
      <p className={cn("mt-1 font-display text-[34px] font-bold leading-none", toneColor[tone])}>
        {value}
      </p>
    </div>
  );
}
