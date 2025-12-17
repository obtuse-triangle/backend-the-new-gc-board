import type { PostWithLocalizations } from "../../types/post";
import type { StrapiMedia } from "../../types/strapi";

export type NormalizedImage = {
  id?: number;
  url: string;
  alt?: string;
  width?: number;
  height?: number;
  formats?: StrapiMedia["formats"];
};

export type NormalizedPost = {
  id: string; // documentId
  legacyId?: number;
  title: string;
  content?: string;
  locale?: string;
  slug?: string;
  images: NormalizedImage[];
  createdAt?: string;
  updatedAt?: string;
};

type RawPost = Partial<PostWithLocalizations> & {
  createdAt?: string;
  updatedAt?: string;
  image?: unknown;
  images?: unknown;
  attributes?:
    | (Partial<PostWithLocalizations> & {
        createdAt?: string;
        updatedAt?: string;
        image?: unknown;
        images?: { data?: Array<{ attributes?: StrapiMedia }> };
      })
    | null;
};

function normalizeMedia(candidate: unknown): StrapiMedia | null {
  const m = candidate as Partial<StrapiMedia> | undefined | null;
  if (!m) return null;
  if (m.url)
    return {
      url: m.url,
      alternativeText: m.alternativeText,
      caption: m.caption,
      formats: m.formats,
      width: m.width,
      height: m.height,
    };
  const maybeAttr = (m as { attributes?: StrapiMedia }).attributes;
  if (maybeAttr?.url)
    return {
      url: maybeAttr.url,
      alternativeText: maybeAttr.alternativeText,
      caption: maybeAttr.caption,
      formats: maybeAttr.formats,
      width: maybeAttr.width,
      height: maybeAttr.height,
    };
  return null;
}

function buildImage(media: (StrapiMedia & { id?: number }) | null): NormalizedImage | null {
  if (!media || !media.url) return null;
  const url = resolveMediaUrl(media);
  if (!url) return null;
  return {
    id: (media as { id?: number }).id,
    url,
    alt: media.alternativeText || media.caption,
    width: media.width,
    height: media.height,
    formats: media.formats,
  };
}

export function resolveMediaUrl(media: StrapiMedia | null): string | undefined {
  if (!media) return undefined;
  const base = (process.env.STRAPI_INTERNAL_URL || "").replace(/\/$/, "");
  if (!media.url) return undefined;
  return media.url.startsWith("http") ? media.url : `${base}${media.url}`;
}

export function normalizePost(raw: unknown): NormalizedPost | null {
  if (!raw) return null;

  // Allow callers to pass Strapi single response objects directly
  const unwrapped =
    (raw as { data?: unknown }).data && !Array.isArray((raw as { data?: unknown }).data)
      ? (raw as { data: unknown }).data
      : raw;

  const data = unwrapped as RawPost;
  const documentId = (data as { documentId?: string }).documentId || data?.attributes?.documentId;
  const legacyId = data.id ?? data?.attributes?.id;
  if (!documentId && legacyId == null) return null;

  const title = data.title || data?.attributes?.title || "";
  const content = data.content || data?.attributes?.content || "";
  const locale = data.locale || data?.attributes?.locale;
  const slug = data.slug || data?.attributes?.slug;
  const createdAt = data.createdAt || data?.attributes?.createdAt;
  const updatedAt = data.updatedAt || data?.attributes?.updatedAt;

  const imageCandidates: Array<NormalizedImage | null> = [];

  // Common single image fields
  imageCandidates.push(buildImage(normalizeMedia(data.image)));
  imageCandidates.push(buildImage(normalizeMedia(data?.attributes?.image)));
  imageCandidates.push(
    buildImage(normalizeMedia((data?.attributes?.image as { data?: unknown } | undefined)?.data))
  );
  imageCandidates.push(
    buildImage(
      normalizeMedia(
        (data?.attributes?.image as { data?: { attributes?: unknown } } | undefined)?.data
          ?.attributes
      )
    )
  );

  // Flattened images array
  if (Array.isArray(data.images as unknown[] | undefined)) {
    for (const img of (data.images as unknown[]) || []) {
      imageCandidates.push(buildImage(normalizeMedia(img)));
    }
  }

  // Strapi default shape: attributes.images.data[].attributes
  const imagesData = data?.attributes?.images?.data;
  if (Array.isArray(imagesData)) {
    for (const item of imagesData) {
      imageCandidates.push(buildImage(normalizeMedia(item?.attributes)));
    }
  }

  // Filter valid images and remove duplicates by url
  const images: NormalizedImage[] = imageCandidates
    .filter((img): img is NormalizedImage => Boolean(img?.url))
    .filter((img, idx, arr) => arr.findIndex((other) => other.url === img.url) === idx);

  return {
    id: documentId || String(legacyId),
    legacyId,
    title,
    content,
    locale,
    slug,
    images,
    createdAt,
    updatedAt,
  };
}
