import { Logo } from "@/components/ui/Logo";

/** Marca de agua: mascota + CALATAFEST, esquina inferior derecha (.85). */
export function WatermarkLogo() {
  return (
    <div className="pointer-events-none absolute bottom-3 right-3 opacity-85">
      <Logo size={20} wordSize={12} />
    </div>
  );
}
