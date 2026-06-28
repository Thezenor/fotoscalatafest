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
        "group relative block w-full overflow-hidden border border-line",
        big ? "h-[158px] rounded-[22px]" : "h-[96px] rounded-md",
      )}
    >
      <Image
        src={image}
        alt={name}
        fill
        sizes="(max-width: 768px) 100vw, 480px"
        className="object-cover transition duration-300 group-hover:scale-[1.03]"
      />
      <div className="overlay-vert absolute inset-0" />

      <Badge className="absolute right-3 top-3">{day}</Badge>

      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-4">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-brand">
          {sub}
        </span>
        <h3
          className={cn(
            "font-display font-bold leading-none text-white",
            big ? "text-[25px]" : "text-[18px]",
          )}
        >
          {name}
        </h3>
        {cta && big && (
          <span className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-pill bg-brand px-3 py-1.5 font-display text-[15px] font-bold uppercase text-brand-ink">
            <Camera className="h-4 w-4" /> {cta} <ArrowRight className="h-4 w-4" />
          </span>
        )}
      </div>
    </Link>
  );
}
