import { cn } from "@/lib/utils";

/** Botón circular con icono (Lucide). Tamaño táctil ≥40px. */
export function IconButton({
  children,
  size = 40,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: number;
  children: React.ReactNode;
}) {
  return (
    <button
      style={{ width: size, height: size }}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-surface-2 text-white",
        "transition hover:brightness-110 active:scale-95",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
