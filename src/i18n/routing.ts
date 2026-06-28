import { defineRouting } from "next-intl/routing";

/**
 * Configuración central de i18n.
 * Idiomas iniciales validados: Español (default) + Inglés.
 * Añadir más idiomas = añadir el código aquí + su archivo en /messages.
 */
export const routing = defineRouting({
  // ES base (completo) + EN + CA (preparados). Ver 07-I18N-LEGAL.md.
  locales: ["es", "en", "ca"],
  defaultLocale: "es",
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];
