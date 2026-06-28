/** Cinta amarilla con texto en bucle infinito (contenido duplicado, anima a -50%). */
export function Marquee({ text }: { text: string }) {
  return (
    <div className="overflow-hidden bg-brand py-1.5">
      <div className="flex w-max animate-marquee whitespace-nowrap will-change-transform">
        {[0, 1].map((i) => (
          <span
            key={i}
            aria-hidden={i === 1}
            className="px-2 font-mono text-[12px] font-bold uppercase tracking-[0.06em] text-brand-ink"
          >
            {text} {text} {text}
          </span>
        ))}
      </div>
    </div>
  );
}
