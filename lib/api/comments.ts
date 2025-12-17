"use client";
import { apiFetch } from "./client";
import type { StrapiListResponse, StrapiSingleResponse } from "../../types/strapi";
import type { Comment } from "../../types/comment";

export async function listComments(relation: string, page = 1, pageSize = 10, locale?: string) {
  const params = new URLSearchParams();
  params.set("pagination[page]", String(page));
  params.set("pagination[pageSize]", String(pageSize));
  if (locale) params.set("locale", locale);

  const qs = params.toString();
  const url = qs ? `/api/comments/${relation}?${qs}` : `/api/comments/${relation}`;

  const res = await apiFetch<StrapiListResponse<Comment> | Comment[]>(url, { locale }, false);
  const data = Array.isArray(res) ? res : res?.data;
  const meta = Array.isArray(res) ? undefined : res?.meta;
  return { data: data || [], meta } as StrapiListResponse<Comment>;
}

export async function createComment(
  relation: string,
  input: Pick<Comment, "content" | "threadOf">,
  authToken?: string,
  locale?: string
) {
  const res = await apiFetch<StrapiSingleResponse<Comment> | Comment>(
    `/api/comments/${relation}`,
    {
      method: "POST",
      authToken,
      // Strapi comments plugin expects locale in the body, not query string
      locale,
      body: locale ? { ...input, locale } : input,
    },
    false
  );
  const data = (res as StrapiSingleResponse<Comment>)?.data || (res as Comment);
  return { data } as StrapiSingleResponse<Comment>;
}

export async function updateComment(
  relation: string,
  commentId: number | string,
  input: Partial<Pick<Comment, "content">>,
  authToken?: string
) {
  const res = await apiFetch<StrapiSingleResponse<Comment> | Comment>(
    `/api/comments/${relation}/comment/${commentId}`,
    {
      method: "PUT",
      authToken,
      body: input,
    },
    false
  );

  const data = (res as StrapiSingleResponse<Comment>)?.data || (res as Comment);
  return { data } as StrapiSingleResponse<Comment>;
}

export async function deleteComment(
  relation: string,
  id: number | string,
  authToken?: string,
  authorId?: number
) {
  const qs = authorId ? `?authorId=${encodeURIComponent(authorId)}` : "";
  return apiFetch(
    `/api/comments/${relation}/comment/${id}${qs}`,
    {
      method: "DELETE",
      authToken,
    },
    false
  );
}
