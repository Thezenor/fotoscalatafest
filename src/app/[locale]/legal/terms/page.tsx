import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { getTerms } from "@/server/services/settings.service";

export const dynamic = "force-dynamic";

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

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("legal");
  const terms = await getTerms();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-1 px-6 py-10">
      <p className="font-mono text-xs uppercase tracking-wide text-mist-2">
        {t("termsTitle")} · v{terms.version}
      </p>
      <article>{renderMarkdown(terms.content)}</article>
    </main>
  );
}
