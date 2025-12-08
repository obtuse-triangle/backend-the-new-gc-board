import type { StrapiMedia } from "./strapi";

export interface Post {
  documentId: string;
  id?: number; // legacy numeric id (may be absent)
  title: string;
  content: string;
  images?: StrapiMedia[];
  slug?: string;
  locale: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PostWithLocalizations extends Post {
  localizations?: { data: Post[] };
}
