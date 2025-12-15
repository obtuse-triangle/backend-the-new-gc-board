import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getServerSession } from "next-auth";
import { defaultLocale, isLocale, type Locale } from "../../../../../i18n";
import { authOptions } from "../../../../../lib/auth";
import { getPost } from "../../../../../lib/api/posts";
import { normalizePost } from "../../../../../lib/posts/normalize";
import PostForm from "../../../../../components/posts/PostForm";
import DeletePostButton from "../../../../../components/posts/DeletePostButton";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale: rawLocale, id } = await params;
  const locale = (isLocale(rawLocale) ? rawLocale : defaultLocale) as Locale;
  const t = await getTranslations({ locale, namespace: "Posts" });
  const session = await getServerSession(authOptions);

  const postResponse = await getPost(id, locale);
  const post = normalizePost(postResponse);
  if (!post) return notFound();

  return (
    <main className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
            {t("edit")}
          </p>
          <h1 className="text-3xl font-bold sm:text-4xl">{t("editTitle")}</h1>
        </div>
        <Link
          href={`/${locale}/posts/${post.id}`}
          className="rounded-full border border-gray-300 px-3 py-1 text-sm text-gray-700 transition hover:border-black hover:text-black dark:border-zinc-700 dark:text-gray-200 dark:hover:border-white dark:hover:text-white"
        >
          {t("back")}
        </Link>
      </div>

      {!session && <p className="text-sm text-red-600">{t("authRequired")}</p>}

      <PostForm locale={locale} mode="edit" post={post} authToken={session?.jwt} />

      {session && (
        <div className="pt-2">
          <DeletePostButton documentId={post.id} locale={locale} authToken={session.jwt} />
        </div>
      )}
    </main>
  );
}
