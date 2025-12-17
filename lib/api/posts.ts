import { apiFetch } from "./client";
import type { StrapiListResponse, StrapiSingleResponse } from "../../types/strapi";
import type { PostWithLocalizations } from "../../types/post";

export interface PostInput {
  title: string;
  content: string;
  locale: string;
  imageIds?: number[];
  slug?: string;
}

export async function listPosts(locale?: string) {
  return apiFetch<StrapiListResponse<PostWithLocalizations>>(
    `/api/articles?populate=*&locale=${encodeURIComponent(locale || "all")}`,
    { locale }
  );
}

export async function getPost(documentId: string, locale?: string) {
  return apiFetch<StrapiSingleResponse<PostWithLocalizations>>(
    `/api/articles/${documentId}?populate=*&locale=${encodeURIComponent(locale || "all")}`,
    { locale }
  );
}

export async function createPost(input: PostInput, authToken?: string) {
  return apiFetch<StrapiSingleResponse<PostWithLocalizations>>(
    `/api/articles`,
    {
      method: "POST",
      authToken,
      locale: input.locale,
      body: {
        data: {
          title: input.title,
          content: input.content,
          locale: input.locale,
          slug: input.slug,
          // Strapi expects single media field `image`
          image: input.imageIds && input.imageIds.length > 0 ? input.imageIds[0] : undefined,
        },
      },
    },
    false
  );
}

export async function updatePost(documentId: string, input: PostInput, authToken?: string) {
  return apiFetch<StrapiSingleResponse<PostWithLocalizations>>(
    `/api/articles/${documentId}`,
    {
      method: "PUT",
      authToken,
      locale: input.locale,
      body: {
        data: {
          title: input.title,
          content: input.content,
          locale: input.locale,
          slug: input.slug,
          image: input.imageIds && input.imageIds.length > 0 ? input.imageIds[0] : undefined,
        },
      },
    },
    false
  );
}

export async function deletePost(documentId: string, authToken?: string) {
  return apiFetch(
    `/api/articles/${documentId}`,
    {
      method: "DELETE",
      authToken,
    },
    false
  );
}
