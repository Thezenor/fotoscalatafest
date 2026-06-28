import { SiteNav } from "@/components/content/SiteNav";
import { SiteFooter } from "@/components/content/SiteFooter";

/** Renderizado mínimo de markdown: # / ## como títulos, **negrita**, párrafos. */
function renderMarkdown(md: string) {
  const lines = md.split("\n");
  const out: React.ReactNode[] = [];
  lines.forEach((line, i) => {
    const bold = (t: string) =>
      t.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={j} className="text-white">{part.slice(2, -2)}</strong>
        ) : (
          part
        ),
      );
    if (line.startsWith("## ")) {
      out.push(<h2 key={i} className="mt-6 font-display text-xl font-bold text-white">{line.slice(3)}</h2>);
    } else if (line.startsWith("# ")) {
      out.push(<h1 key={i} className="font-display text-3xl font-bold text-white">{line.slice(2)}</h1>);
    } else if (line.trim() === "") {
      // separación
    } else {
      out.push(<p key={i} className="mt-2 font-body text-sm leading-relaxed text-mist">{bold(line)}</p>);
    }
  });
  return out;
}

/** Página de documento legal (términos, privacidad…) con navegación. */
export function LegalDoc({ eyebrow, content }: { eyebrow: string; content: string }) {
  return (
    <main className="w-full flex-1">
      <SiteNav />
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-1 px-6 py-10">
        <p className="font-mono text-xs uppercase tracking-wide text-mist-2">{eyebrow}</p>
        <article>{renderMarkdown(content)}</article>
      </div>
      <SiteFooter />
    </main>
  );
}
