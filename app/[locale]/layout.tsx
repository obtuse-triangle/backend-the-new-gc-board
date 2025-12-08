import type { Metadata } from "next";
import { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { defaultLocale, getMessages, locales, isLocale, type Locale } from "../../i18n";
import { SessionProvider } from "../../components/SessionProvider";
import GNB from "../../components/layout/GNB";
import "../globals.css";

export const dynamic = "force-dynamic";

export function generateStaticParams(): { locale: Locale }[] {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = (isLocale(rawLocale) ? rawLocale : defaultLocale) as Locale;
  const t = await getTranslations({ locale, namespace: "Home" });
  return {
    title: t("title"),
    description: t("subtitle"),
    alternates: {
      languages: Object.fromEntries(locales.map((l) => [l, `/${l}`])),
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = (isLocale(rawLocale) ? rawLocale : defaultLocale) as Locale;
  setRequestLocale(locale);
  const messages = await getMessages(locale);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <SessionProvider>
        <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-zinc-950 dark:text-gray-50">
          <GNB />
          <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
        </div>
      </SessionProvider>
    </NextIntlClientProvider>
  );
}
