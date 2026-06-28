import Image from "next/image";
import { Camera, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

export function StageCard({
  image,
  name,
  sub,
  day,
  href,
  cta,
  size = "lg",
}: {
  image: string;
  name: string;
  sub: string;
  day: string;
  href: string;
  cta?: string;
  size?: "lg" | "sm";
}) {
  const big = size === "lg";
  return (
    <Link
      href={href}
      className={cn(
        "group relative block w-full overflow-hidden rounded-[20px] border border-line shadow-card transition duration-300 hover:-translate-y-1 hover:border-brand/60",
        big ? "h-[230px]" : "h-[200px]",
      )}
    >
      <Image
        src={image}
        alt={name}
        fill
        sizes="(max-width: 768px) 100vw, 420px"
        className="object-cover transition duration-500 group-hover:scale-105"
      />
      {/* Degradado más marcado para que el texto siempre sea legible */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/10" />

      {day && (
        <Badge className="absolute right-3 top-3 shadow-md">{day}</Badge>
      )}

      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1.5 p-4 lg:p-5">
        {sub && (
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
            {sub}
          </span>
        )}
        <h3 className="font-display text-[22px] font-bold leading-[1.05] text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] lg:text-[26px]">
          {name}
        </h3>
        <span className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-pill bg-brand px-3.5 py-1.5 font-display text-[13px] font-bold uppercase text-brand-ink transition group-hover:gap-2.5">
          <Camera className="h-4 w-4" /> {cta ?? "Subir foto"}
          <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}
