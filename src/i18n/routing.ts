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
  // "always": cada idioma lleva prefijo (/es, /en, /ca). Evita el bucle de
  // redirección de "as-needed" detrás del proxy de Railway y da URLs deterministas.
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];
