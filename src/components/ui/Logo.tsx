import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Logo Calatafest = mascota de auriculares + wordmark "CALATAFEST".
 * ⚠️ PLACEHOLDER: la mascota usa /brand/mascot-white.svg. Sustituir por el asset
 * oficial (PNG/SVG blanco) cuando llegue, sin cambiar la API de este componente.
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
      <Image
        src={tone === "white" ? "/brand/mascot-white.svg" : "/brand/mascot-dark.svg"}
        alt="Calatafest"
        width={size}
        height={size}
        priority
        unoptimized
        style={{ width: size, height: "auto" }}
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
