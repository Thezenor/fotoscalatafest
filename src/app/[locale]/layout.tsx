import type { Metadata } from "next";
import { Fredoka, Hanken_Grotesk, Chakra_Petch } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { siteUrl, localizedAlternates } from "@/lib/seo";
import "../globals.css";

// Display redondeada (titulares/botones), cuerpo limpio, técnica para badges.
const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-fredoka",
});
const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-hanken",
});
const chakra = Chakra_Petch({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-chakra",
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "landing" });
  const title = "Calatafest Fotos";
  const description = t("subtitle");

  return {
    metadataBase: new URL(siteUrl()),
    title: { default: title, template: `%s · ${title}` },
    description,
    applicationName: title,
    alternates: localizedAlternates(locale, "/"),
    openGraph: {
      type: "website",
      siteName: title,
      title,
      description,
      url: `${siteUrl()}/${locale}`,
      locale,
      images: [{ url: "/demo/p10.png", width: 900, height: 600, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: ["/demo/p10.png"] },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      className={`${fredoka.variable} ${hanken.variable} ${chakra.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-ink text-white font-body antialiased">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
