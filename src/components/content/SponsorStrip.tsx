import { Eyebrow } from "@/components/ui/Eyebrow";
import { cn } from "@/lib/utils";

// ⚠️ Placeholders de texto. Pedir los SVG oficiales y colocarlos en /public/sponsors,
// luego renderizar <Image> monocromo (blanco) en lugar del texto.
const DEFAULT_SPONSORS = [
  "Heraldo",
  "Coca-Cola",
  "Beefeater",
  "Ibercaja",
  "Ámbar",
  "Bono Cultural",
];

export function SponsorStrip({
  title,
  sponsors = DEFAULT_SPONSORS,
  align = "center",
  className,
}: {
  title: string;
  sponsors?: string[];
  align?: "center" | "start";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" ? "items-center text-center" : "items-start",
        className,
      )}
    >
      <Eyebrow tone="mist" className="tracking-[0.28em]">
        {title}
      </Eyebrow>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 opacity-75">
        {sponsors.map((s) => (
          <span
            key={s}
            className="font-body text-[13px] font-semibold text-white"
          >
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}
