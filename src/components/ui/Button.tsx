import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "success" | "danger" | "ghostIcon";
type Size = "lg" | "md" | "sm";

const base =
  "inline-flex items-center justify-center gap-2 rounded-pill font-display font-bold " +
  "transition duration-150 hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] " +
  "disabled:opacity-45 disabled:pointer-events-none select-none";

const variants: Record<Variant, string> = {
  primary: "bg-brand text-brand-ink",
  secondary: "border border-white/60 bg-white/[0.06] text-white backdrop-blur",
  success: "bg-success text-success-ink",
  danger: "bg-danger text-white",
  ghostIcon: "bg-surface-2 text-white rounded-full",
};

const sizes: Record<Size, string> = {
  lg: "h-[58px] px-7 text-[18px]", // CTA principal ≥56px
  md: "h-[54px] px-6 text-[16px]",
  sm: "h-[44px] px-4 text-[15px]",
};

/** Helper de clases para aplicar el estilo de botón a un <Link> u otro elemento. */
export function buttonClass(opts?: {
  variant?: Variant;
  size?: Size;
  className?: string;
}) {
  const { variant = "primary", size = "lg", className } = opts ?? {};
  return cn(base, variants[variant], sizes[size], className);
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({
  variant = "primary",
  size = "lg",
  className,
  ...props
}: ButtonProps) {
  return <button className={buttonClass({ variant, size, className })} {...props} />;
}
