import { routing } from "@/i18n/routing";

/** URL base del sitio (para metadatos absolutos). */
export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

/** URL absoluta a partir de una ruta (admite rutas relativas o ya absolutas). */
export function absoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//.test(pathOrUrl)) return pathOrUrl;
  return `${siteUrl()}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}

/**
 * Alternates de idioma (hreflang) para una ruta SIN prefijo de locale.
 * p.ej. localeAlternates("/galeria") → { es:/es/galeria, en:/en/galeria, ca:/ca/galeria }
 */
export function localeAlternates(pathNoLocale: string) {
  const clean = pathNoLocale === "/" ? "" : pathNoLocale;
  const languages: Record<string, string> = {};
  for (const l of routing.locales) {
    languages[l] = `${siteUrl()}/${l}${clean}`;
  }
  return languages;
}

/** Canonical + alternates para una página localizada. */
export function localizedAlternates(locale: string, pathNoLocale: string) {
  const clean = pathNoLocale === "/" ? "" : pathNoLocale;
  return {
    canonical: `${siteUrl()}/${locale}${clean}`,
    languages: localeAlternates(pathNoLocale),
  };
}
