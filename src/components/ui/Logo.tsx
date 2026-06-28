import { cn } from "@/lib/utils";

/**
 * Logo Calatafest = imagen de marca + wordmark "CALATAFEST".
 * La imagen se sirve desde /api/brand/logo (logo oficial subido desde el
 * superadmin, o la mascota placeholder por defecto). Cambiarlo en
 * /superadmin/branding sin tocar código.
 */
export function Logo({
  size = 30,
  wordmark = true,
  word = "CALATAFEST",
  wordSize = 18,
  tone = "white",
  className,
}: {
  size?: number;
  wordmark?: boolean;
  word?: string;
  wordSize?: number;
  tone?: "white" | "ink";
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/api/brand/logo"
        alt="Calatafest"
        style={{ height: size, width: "auto" }}
      />
      {wordmark && (
        <span
          className="font-display font-bold leading-none tracking-tight"
          style={{ fontSize: wordSize, color: tone === "white" ? "#fff" : "#0E0E0E" }}
        >
          {word}
        </span>
      )}
    </span>
  );
}
