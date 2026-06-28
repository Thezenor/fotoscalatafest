import { cn } from "@/lib/utils";

type Tone = "brand" | "success" | "danger" | "neutral";

const tones: Record<Tone, string> = {
  brand: "bg-brand text-brand-ink",
  success: "bg-success text-success-ink",
  danger: "bg-danger text-white",
  neutral: "border border-line bg-surface-2 text-white",
};

export function Badge({
  children,
  tone = "brand",
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-pill px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.1em]",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
