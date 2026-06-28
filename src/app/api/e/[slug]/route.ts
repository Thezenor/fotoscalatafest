import { NextRequest, NextResponse } from "next/server";
import { isValidAccessToken } from "@/server/services/event.service";
import { accessCookieName } from "@/lib/access";

// Punto de entrada del QR del evento:  /api/e/<slug>?t=<token>
// Valida el token, fija la cookie de acceso y redirige a la landing.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const token = req.nextUrl.searchParams.get("t");

  const valid = await isValidAccessToken(slug, token);
  const landing = new URL(`/e/${slug}`, req.nextUrl.origin);
  if (!valid) {
    landing.searchParams.set("denied", "1");
    return NextResponse.redirect(landing);
  }

  const res = NextResponse.redirect(landing);
  res.cookies.set(accessCookieName(slug), token as string, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 12,
  });
  return res;
}
