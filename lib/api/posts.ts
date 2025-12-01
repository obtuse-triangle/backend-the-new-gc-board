import { apiFetch } from "./client";
import type { StrapiListResponse, StrapiSingleResponse } from "../../types/strapi";
import type { Post, PostWithLocalizations } from "../../types/post";

export async function listPosts(locale?: string) {
  return apiFetch<StrapiListResponse<PostWithLocalizations>>(
    `/api/posts?populate=*&locale=${encodeURIComponent(locale || "all")}`,
    { locale }
  );
}

export async function getPost(id: number, locale?: string) {
  return apiFetch<StrapiSingleResponse<PostWithLocalizations>>(
    `/api/posts/${id}?populate=*&locale=${encodeURIComponent(locale || "all")}`,
    { locale }
  );
}
