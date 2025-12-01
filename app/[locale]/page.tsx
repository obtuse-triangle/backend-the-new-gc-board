import { getTranslations } from "next-intl/server";
import LanguageSwitcher from "../../components/layout/LanguageSwitcher";

export default async function HomeLocalePage() {
  const t = await getTranslations("Home");
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
