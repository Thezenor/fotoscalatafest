import { cn } from "@/lib/utils";

/** Overline técnica (Chakra Petch, mayúsculas, tracking amplio). */
export function Eyebrow({
  children,
  tone = "brand",
  className,
}: {
  children: React.ReactNode;
  tone?: "brand" | "mist";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "font-mono text-[12px] font-semibold uppercase tracking-[0.22em]",
        tone === "brand" ? "text-brand" : "text-mist-2",
        className,
      )}
    >
      {children}
    </span>
  );
}
