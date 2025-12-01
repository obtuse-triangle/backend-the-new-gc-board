import type { StrapiMedia } from "./strapi";

export interface Post {
  id: number;
  title: string;
  content: string;
  images?: StrapiMedia[];
  slug?: string;
  locale: string;
}

export interface PostWithLocalizations extends Post {
  localizations?: { data: Post[] };
}
