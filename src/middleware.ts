import createMiddleware from "next-intl/middleware";
import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/server/auth/auth.config";
import { routing } from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);
const { auth } = NextAuth(authConfig);

// Quita el prefijo de locale para razonar sobre la ruta "lógica".
function stripLocale(pathname: string): string {
  const segments = pathname.split("/");
  if (segments[1] && routing.locales.includes(segments[1] as never)) {
    return "/" + segments.slice(2).join("/");
  }
  return pathname;
}

export default auth((req) => {
  const path = stripLocale(req.nextUrl.pathname);
  const isProtected = path.startsWith("/admin") || path.startsWith("/superadmin");
  const isLogin = path === "/admin/login";

  // Rutas de backoffice: exigir sesión (salvo la propia pantalla de login).
  if (isProtected && !isLogin && !req.auth) {
    const url = new URL("/admin/login", req.nextUrl.origin);
    url.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Solo SUPERADMIN puede entrar a /superadmin.
  if (path.startsWith("/superadmin") && req.auth?.user?.role !== "SUPERADMIN") {
    return NextResponse.redirect(new URL("/admin", req.nextUrl.origin));
  }

  // El resto sigue el flujo i18n normal.
  return intlMiddleware(req);
});

export const config = {
  // Aplica a todo salvo API, assets internos de Next y archivos estáticos.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
