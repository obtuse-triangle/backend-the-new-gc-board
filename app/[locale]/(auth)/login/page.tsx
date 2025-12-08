import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { LoginForm } from "@/components/ui/LoginForm";
import { defaultLocale, isLocale, type Locale } from "@/i18n";

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = (isLocale(rawLocale) ? rawLocale : defaultLocale) as Locale;
  const tLogin = await getTranslations({ locale, namespace: "Auth.Login" });

  return (
    <main className="mx-auto flex max-w-md flex-col gap-6 px-4 py-10">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">{tLogin("title")}</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">{tLogin("subtitle")}</p>
      </div>

      <LoginForm />

      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        <Link href={`/${locale}/register`} className="font-semibold text-black underline dark:text-white">
          {tLogin("switch")}
        </Link>
      </p>
    </main>
  );
}
