import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { getPost } from "../../../../lib/api/posts";
import { defaultLocale, isLocale, type Locale } from "../../../../i18n";
import { normalizePost, type NormalizedImage } from "../../../../lib/posts/normalize";
import ImageGallery from "../../../../components/posts/ImageGallery";

function formatDate(value?: string, locale?: Locale) {
  if (!value) return "";
  try {
    return new Intl.DateTimeFormat(locale || "en", { dateStyle: "medium" }).format(new Date(value));
  } catch {
    return value;
  }
}

function resolveHeroUrl(image?: NormalizedImage) {
  if (!image) return "";
  const base = (process.env.NEXT_PUBLIC_STRAPI_URL || "").replace(/\/$/, "");
  const raw =
    image.formats?.xlarge?.url ||
    image.formats?.large?.url ||
    image.formats?.medium?.url ||
    image.url;
  if (!raw) return "";
  return raw.startsWith("http") ? raw : `${base}${raw}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale: rawLocale, id } = await params;
  const locale = (isLocale(rawLocale) ? rawLocale : defaultLocale) as Locale;
  const postResponse = await getPost(id, locale);
  const post = normalizePost(postResponse);
  return {
    title: post?.title || "Post",
    description: post?.content?.slice(0, 120),
  };
}

export default async function PostDetailPage({
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

  const cover = post.images[0];
  const heroUrl = resolveHeroUrl(cover);
  const galleryImages = post.images.slice(1); // avoid duplicating the cover image below

  return (
    <main className="space-y-8">
      <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-300">
        <Link
          href={`/${locale}/posts`}
          className="rounded-full border border-gray-300 px-3 py-1 transition hover:border-black hover:text-black dark:border-zinc-700 dark:hover:border-white dark:hover:text-white"
        >
          {t("back")}
        </Link>
        {session && (
          <Link
            href={`/${locale}/posts/${post.id}/edit`}
            className="rounded-full bg-black px-3 py-1 text-white transition hover:-translate-y-0.5 hover:shadow-md dark:bg-white dark:text-black"
          >
            {t("edit")}
          </Link>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.3fr,1fr]">
        <div className="relative h-[420px] overflow-hidden rounded-3xl border border-gray-200 bg-black shadow-2xl sm:h-[520px] dark:border-zinc-800">
          {heroUrl ? (
            <Image
              src={heroUrl}
              alt={cover?.alt || post.title}
              width={1600}
              height={1200}
              priority
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full min-h-[360px] items-center justify-center bg-linear-to-br from-gray-200 to-gray-100 text-gray-500 dark:from-zinc-800 dark:to-zinc-900">
              {t("noImage")}
            </div>
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <p className="text-xs uppercase tracking-[0.2em] text-white/70">{t("featured")}</p>
            <h1 className="mt-2 text-3xl font-semibold leading-tight sm:text-4xl">{post.title}</h1>
          </div>
        </div>

        <div className="space-y-4 rounded-3xl border border-gray-200 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/80">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
              {t("details")}
            </p>
            <p className="text-base text-gray-700 dark:text-gray-200 whitespace-pre-line">
              {post.content}
            </p>
          </div>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-gray-100 px-3 py-2 text-gray-800 dark:bg-zinc-800 dark:text-gray-200">
              <dt className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                {t("created")}
              </dt>
              <dd className="font-semibold">{formatDate(post.createdAt, locale)}</dd>
            </div>
            <div className="rounded-xl bg-gray-100 px-3 py-2 text-gray-800 dark:bg-zinc-800 dark:text-gray-200">
              <dt className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                {t("updated")}
              </dt>
              <dd className="font-semibold">{formatDate(post.updatedAt, locale)}</dd>
            </div>
          </dl>
          <div className="rounded-xl bg-gray-100 px-3 py-2 text-sm text-gray-700 dark:bg-zinc-800 dark:text-gray-200">
            <span className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
              {t("locale")}
            </span>
            <div className="font-semibold">{post.locale || locale}</div>
          </div>
        </div>
      </div>

      {galleryImages.length > 0 && (
        <ImageGallery images={galleryImages} title={post.title} ctaLabel={t("gallery")} />
      )}
    </main>
  );
}
