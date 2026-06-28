import { defineRouting } from "next-intl/routing";

/**
 * Configuración central de i18n.
 * Idiomas iniciales validados: Español (default) + Inglés.
 * Añadir más idiomas = añadir el código aquí + su archivo en /messages.
 */
export const routing = defineRouting({
  locales: ["es", "en"],
  defaultLocale: "es",
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];
