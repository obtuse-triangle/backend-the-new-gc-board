import Image from "next/image";
import Link from "next/link";
import type { NormalizedPost } from "../../lib/posts/normalize";

function pickCover(post: NormalizedPost) {
  return post.images[0];
}

export function PostCard({
  post,
  locale,
  ctaLabel = "View",
}: {
  post: NormalizedPost;
  locale: string;
  ctaLabel?: string;
}) {
  const cover = pickCover(post);

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
      <div className="relative h-56 w-full overflow-hidden">
        {cover ? (
          <Image
            src={cover.url}
            alt={cover.alt || post.title}
            fill
            sizes="(min-width: 1024px) 420px, 100vw"
            className="object-cover transition duration-300 group-hover:scale-105"
            priority={false}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-gray-200 to-gray-100 text-gray-500 dark:from-zinc-800 dark:to-zinc-900">
            No image
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent opacity-90" />
        <div className="absolute inset-x-0 bottom-0 p-4 text-white">
          <p className="text-xs uppercase tracking-[0.2em] text-white/70">
            {post.locale || locale}
          </p>
          <h3 className="mt-1 line-clamp-2 text-lg font-semibold leading-tight">{post.title}</h3>
        </div>
      </div>
      <div className="flex items-center justify-between px-4 py-3 text-sm">
        <span className="text-gray-600 dark:text-gray-300 line-clamp-2">{post.content || ""}</span>
        <Link
          href={`/${locale}/posts/${post.id}`}
          className="ml-3 inline-flex items-center gap-1 rounded-full bg-black px-3 py-1 text-xs font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-md dark:bg-white dark:text-black"
        >
          {ctaLabel}
        </Link>
      </div>
    </article>
  );
}

export default PostCard;
