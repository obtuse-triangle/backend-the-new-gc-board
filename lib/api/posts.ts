import { apiFetch } from "./client";
import type { StrapiListResponse, StrapiSingleResponse } from "../../types/strapi";
import type { PostWithLocalizations } from "../../types/post";

export async function listPosts(locale?: string) {
  return apiFetch<StrapiListResponse<PostWithLocalizations>>(
    `/api/articles?populate=*&locale=${encodeURIComponent(locale || "all")}`,
    { locale }
  );
}

export async function getPost(id: number, locale?: string) {
  return apiFetch<StrapiSingleResponse<PostWithLocalizations>>(
    `/api/articles/${id}?populate=*&locale=${encodeURIComponent(locale || "all")}`,
    { locale }
  );
}
