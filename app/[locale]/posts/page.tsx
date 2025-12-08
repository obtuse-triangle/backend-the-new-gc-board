import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getServerSession } from "next-auth";
import PostCard from "../../../components/posts/PostCard";
import { defaultLocale, isLocale, type Locale } from "../../../i18n";
import { listPosts } from "../../../lib/api/posts";
import { normalizePost } from "../../../lib/posts/normalize";
import { authOptions } from "../../../lib/auth";

export default async function PostsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = (isLocale(rawLocale) ? rawLocale : defaultLocale) as Locale;
  const t = await getTranslations({ locale, namespace: "Posts" });
  const session = await getServerSession(authOptions);

  const postsResponse = await listPosts(locale);
  const posts = (postsResponse?.data || [])
    .map(normalizePost)
    .filter((p): p is NonNullable<ReturnType<typeof normalizePost>> => Boolean(p));

  return (
    <main className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">{t("subtitle")}</p>
          <h1 className="text-3xl font-bold sm:text-4xl">{t("title")}</h1>
        </div>
        <Link
          href={`/${locale}/posts/new`}
          className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:bg-white dark:text-black"
          prefetch
        >
          {t("new")}
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white/70 p-10 text-center text-gray-600 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-gray-300">
          {t("empty")}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} locale={locale} ctaLabel={t("view")} />
          ))}
        </div>
      )}

      {!session && (
        <p className="text-sm text-gray-600 dark:text-gray-300">{t("authRequired")}</p>
      )}
    </main>
  );
}
