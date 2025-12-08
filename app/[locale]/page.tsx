import { getTranslations } from "next-intl/server";
import LanguageSwitcher from "../../components/layout/LanguageSwitcher";
import { defaultLocale, isLocale, type Locale } from "../../i18n";

export default async function HomeLocalePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = (isLocale(rawLocale) ? rawLocale : defaultLocale) as Locale;
  const t = await getTranslations({ locale, namespace: "Home" });

  return (
    <main className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <LanguageSwitcher />
      </div>
      <p className="text-gray-600 dark:text-gray-300">{t("subtitle")}</p>
    </main>
  );
}
