import { cn } from "@/lib/utils";

const fieldBase =
  "w-full bg-surface-2 border border-line rounded-sm text-white font-body text-[15px] " +
  "placeholder:text-mist outline-none transition " +
  "focus:border-brand focus:ring-2 focus:ring-brand/30";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldBase, "h-[50px] px-4", className)} {...props} />;
}

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(fieldBase, "min-h-[62px] px-4 py-3 resize-none", className)}
      {...props}
    />
  );
}
