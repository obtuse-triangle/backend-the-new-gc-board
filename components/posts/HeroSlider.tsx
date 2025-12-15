"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export type HeroSlide = {
  id: number | string;
  title: string;
  imageUrl: string;
  alt?: string;
  href: string;
};

function classNames(...values: Array<string | false | undefined | null>) {
  return values.filter(Boolean).join(" ");
}

export function HeroSlider({ slides, ctaLabel }: { slides: HeroSlide[]; ctaLabel: string }) {
  const [active, setActive] = useState(0);

  const safeSlides = useMemo(() => slides.filter((s) => Boolean(s.imageUrl)), [slides]);

  useEffect(() => {
    if (safeSlides.length === 0) return;
    const id = setInterval(() => {
      setActive((prev) => (prev + 1) % safeSlides.length);
    }, 4800);
    return () => clearInterval(id);
  }, [safeSlides]);

  if (safeSlides.length === 0) return null;

  const current = safeSlides[active];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-gray-900 via-gray-800 to-black text-white shadow-xl">
      <div className="relative h-[360px] w-full sm:h-[420px]">
        <div key={current.id} className="absolute inset-0 animate-fade-slide">
          <Image
            src={current.imageUrl}
            alt={current.alt || current.title}
            fill
            priority
            sizes="(min-width: 1024px) 1024px, 100vw"
            className="object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black via-black/20 to-transparent" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
          <p className="text-sm uppercase tracking-[0.2em] text-gray-300">
            {active + 1} / {safeSlides.length}
          </p>
          <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">{current.title}</h2>
          <div className="mt-4 flex items-center gap-3">
            <Link
              href={current.href}
              className="rounded bg-white px-4 py-2 text-sm font-semibold text-black shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              {ctaLabel}
            </Link>
            <div className="flex items-center gap-2">
              {safeSlides.map((slide, idx) => (
                <button
                  key={slide.id}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={classNames(
                    "h-2 w-2 rounded-full border border-white/60 transition",
                    idx === active ? "bg-white" : "bg-white/20 hover:bg-white/40"
                  )}
                  onClick={() => setActive(idx)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        .animate-fade-slide {
          animation: fadeSlide 650ms ease both;
        }
        @keyframes fadeSlide {
          from {
            opacity: 0;
            transform: translate3d(0, 12px, 0) scale(1.01);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}

export default HeroSlider;
