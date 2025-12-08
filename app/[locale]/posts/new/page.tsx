import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getServerSession } from "next-auth";
import { defaultLocale, isLocale, type Locale } from "../../../../i18n";
import { authOptions } from "../../../../lib/auth";
import PostForm from "../../../../components/posts/PostForm";

export default async function NewPostPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = (isLocale(rawLocale) ? rawLocale : defaultLocale) as Locale;
  const t = await getTranslations({ locale, namespace: "Posts" });
  const session = await getServerSession(authOptions);

  return (
    <main className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">{t("new")}</p>
          <h1 className="text-3xl font-bold sm:text-4xl">{t("createTitle")}</h1>
        </div>
        <Link
          href={`/${locale}/posts`}
          className="rounded-full border border-gray-300 px-3 py-1 text-sm text-gray-700 transition hover:border-black hover:text-black dark:border-zinc-700 dark:text-gray-200 dark:hover:border-white dark:hover:text-white"
        >
          {t("back")}
        </Link>
      </div>

      {!session && <p className="text-sm text-red-600">{t("authRequired")}</p>}

      <PostForm locale={locale} mode="create" authToken={session?.jwt} />
    </main>
  );
}
