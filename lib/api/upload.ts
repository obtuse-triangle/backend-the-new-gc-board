import { apiFetch } from "./client";

export async function uploadFiles(files: File[]) {
  const base = process.env.NEXT_PUBLIC_STRAPI_URL || "";
  const url = `${base}/api/upload`;

  const form = new FormData();
  for (const f of files) form.append("files", f);

  const headers: HeadersInit = {};
  if (typeof window === "undefined" && process.env.STRAPI_API_TOKEN) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${process.env.STRAPI_API_TOKEN}`;
  }

  const res = await fetch(url, { method: "POST", body: form, headers });
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
  return res.json();
}
