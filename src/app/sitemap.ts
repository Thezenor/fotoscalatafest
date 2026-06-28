import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { siteUrl } from "@/lib/seo";
import { listApprovedPhotos } from "@/server/services/photo.service";

// Se genera bajo demanda (lee fotos aprobadas de la DB).
export const dynamic = "force-dynamic";

function alts(pathNoLocale: string) {
  const base = siteUrl();
  const clean = pathNoLocale === "/" ? "" : pathNoLocale;
  return Object.fromEntries(routing.locales.map((l) => [l, `${base}/${l}${clean}`]));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const def = routing.defaultLocale;
  const staticPaths = ["/", "/galeria", "/escenarios", "/legal/terms"];

  const entries: MetadataRoute.Sitemap = staticPaths.map((p) => ({
    url: `${base}/${def}${p === "/" ? "" : p}`,
    changeFrequency: "daily",
    priority: p === "/" ? 1 : 0.7,
    alternates: { languages: alts(p) },
  }));

  try {
    const photos = await listApprovedPhotos();
    for (const ph of photos) {
      entries.push({
        url: `${base}/${def}/foto/${ph.id}`,
        lastModified: ph.createdAt,
        changeFrequency: "weekly",
        priority: 0.5,
        alternates: { languages: alts(`/foto/${ph.id}`) },
      });
    }
  } catch {
    // Sin DB disponible: devolvemos solo las rutas estáticas.
  }

  return entries;
}
