import Link from "next/link";
import { getTranslations } from "next-intl/server";
import HeroSlider, { HeroSlide } from "../../components/posts/HeroSlider";
import { defaultLocale, isLocale, type Locale } from "../../i18n";
import { listPosts } from "../../lib/api/posts";
import type { StrapiMedia } from "../../types/strapi";
import type { PostWithLocalizations } from "../../types/post";

type StrapiPostShape = PostWithLocalizations & {
  documentId?: string;
  attributes?: {
    documentId?: string;
    id?: number;
    title?: string;
    image?:
      | StrapiMedia
      | {
          data?: { attributes?: StrapiMedia & { formats?: StrapiMedia["formats"] } } | null;
        };
    images?: { data?: Array<{ attributes?: StrapiMedia & { formats?: StrapiMedia["formats"] } }> };
  };
  image?: StrapiMedia; // fallback if API is flattened
};

function normalizeMedia(candidate: unknown): StrapiMedia | null {
  const m = candidate as Partial<StrapiMedia> | undefined | null;
  if (!m) return null;
  if (m.url) return { url: m.url, alternativeText: m.alternativeText, formats: m.formats };
  const maybeAttr = (m as { attributes?: StrapiMedia }).attributes;
  if (maybeAttr?.url)
    return {
      url: maybeAttr.url,
      alternativeText: maybeAttr.alternativeText,
      formats: maybeAttr.formats,
    };
  return null;
}

function pickImageFromPost(post: StrapiPostShape): StrapiMedia | null {
  // single image field
  const fromImage =
    normalizeMedia(post.image) ||
    normalizeMedia(post.attributes?.image) ||
    normalizeMedia((post.attributes?.image as { data?: unknown } | undefined)?.data) ||
    normalizeMedia(
      (post.attributes?.image as { data?: { attributes?: unknown } } | undefined)?.data?.attributes
    );
  if (fromImage) return fromImage;

  if (post?.images && Array.isArray(post.images) && post.images.length > 0) return post.images[0];

  // Strapi default shape: post.attributes.images.data[].attributes
  const images = post?.attributes?.images?.data;
  if (Array.isArray(images) && images.length > 0) {
    const first = images[0]?.attributes;
    if (first?.url)
      return { url: first.url, alternativeText: first.alternativeText, formats: first.formats };
  }

  return null;
}

function resolveMediaUrl(media: StrapiMedia | null): string | undefined {
  if (!media) return undefined;
  const base = (process.env.NEXT_PUBLIC_STRAPI_URL || "").replace(/\/$/, "");
  if (!media.url) return undefined;
  return media.url.startsWith("http") ? media.url : `${base}${media.url}`;
}

export default async function HomeLocalePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = (isLocale(rawLocale) ? rawLocale : defaultLocale) as Locale;
  const t = await getTranslations({ locale, namespace: "Home" });

  const posts = await listPosts(locale);
  const slides = (posts?.data || [])
    .map((post: StrapiPostShape) => {
      const mainImage = pickImageFromPost(post);
      const url =
        resolveMediaUrl(mainImage?.formats?.large || null) ||
        resolveMediaUrl(mainImage?.formats?.medium || null) ||
        resolveMediaUrl(mainImage);
      if (!url) return null;
      const id = post.documentId || post?.attributes?.documentId;
      if (!id) return null;
      const title = post.title || post?.attributes?.title || "";
      const href = `/${locale}/posts/${id}`;
      const slide: HeroSlide = { id, title, imageUrl: url, alt: mainImage?.alternativeText, href };
      return slide;
    })
    .filter((slide): slide is HeroSlide => Boolean(slide));

  return (
    <main className="space-y-8">
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
          {t("subtitle")}
        </p>
        <h1 className="text-3xl font-bold sm:text-4xl">{t("headline")}</h1>
      </div>

      {slides.length > 0 ? (
        <HeroSlider slides={slides} ctaLabel={t("cta")} />
      ) : (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white/60 p-10 text-center text-gray-600 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-gray-300">
          {t("empty")}
        </div>
      )}

      <div>
        <Link
          href={`/${locale}/posts`}
          className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:bg-white dark:text-black"
        >
          {t("cta")}
        </Link>
      </div>
    </main>
  );
}
