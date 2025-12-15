"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import type { NormalizedImage } from "../../lib/posts/normalize";
import "yet-another-react-lightbox/styles.css";

const Lightbox = dynamic(() => import("yet-another-react-lightbox"), { ssr: false });

function resolveUrl(image: NormalizedImage, size?: string) {
  const base = (process.env.NEXT_PUBLIC_STRAPI_URL || "").replace(/\/$/, "");
  const fromFormat = size && image.formats?.[size]?.url;
  if (fromFormat) return fromFormat.startsWith("http") ? fromFormat : `${base}${fromFormat}`;
  if (image.url) return image.url.startsWith("http") ? image.url : `${base}${image.url}`;
  return "";
}

export function ImageGallery({
  images,
  title,
  ctaLabel = "View gallery",
}: {
  images: NormalizedImage[];
  title?: string;
  ctaLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const slides = useMemo(
    () => images.map((img) => ({ src: resolveUrl(img, "large") || resolveUrl(img) })),
    [images]
  );

  if (!images.length) return null;

  const hero = images[0];
  const heroUrl = resolveUrl(hero, "xlarge") || resolveUrl(hero, "large") || resolveUrl(hero);
  if (!heroUrl) return null;

  const gallerySlides = slides.filter((slide) => Boolean(slide.src));

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-black shadow-xl dark:border-zinc-800">
        <Image
          src={heroUrl}
          alt={hero.alt || title || "Post image"}
          width={1600}
          height={900}
          priority
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between p-4 text-white">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/70">{title || ""}</p>
            <p className="text-lg font-semibold">{hero.alt || ""}</p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/25"
          >
            {ctaLabel}
          </button>
        </div>
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.slice(1, 7).map((img, idx) => {
            const url = resolveUrl(img, "medium") || resolveUrl(img);
            return (
              <button
                key={url + idx}
                type="button"
                onClick={() => setOpen(true)}
                className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
              >
                <Image
                  src={url}
                  alt={img.alt || title || `Image ${idx + 2}`}
                  width={600}
                  height={400}
                  className="h-32 w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 transition duration-200 group-hover:bg-black/30" />
              </button>
            );
          })}
        </div>
      )}

      {open && gallerySlides.length > 0 && (
        <Lightbox open={open} close={() => setOpen(false)} slides={gallerySlides} />
      )}
    </div>
  );
}

export default ImageGallery;
