import { apiFetch } from "./client";
import type { StrapiListResponse, StrapiSingleResponse } from "../../types/strapi";
import type { Comment } from "../../types/comment";

export async function listComments(postId: number, cursor?: number, limit = 20) {
  const params = new URLSearchParams();
  params.set("filters[postId][$eq]", String(postId));
  if (cursor) params.set("filters[id][$lt]", String(cursor));
  params.set("sort", "id:desc");
  params.set("pagination[pageSize]", String(limit));

  return apiFetch<StrapiListResponse<Comment>>(`/api/comments?${params.toString()}`);
}

export async function createComment(input: Pick<Comment, "postId" | "content">) {
  return apiFetch<StrapiSingleResponse<Comment>>(`/api/comments`, {
    method: "POST",
    body: { data: input },
  });
}
