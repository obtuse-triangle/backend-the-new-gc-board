type ApiOptions = {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
  locale?: string;
  cache?: RequestCache;
  next?: { revalidate?: number; tags?: string[] };
};

export async function apiFetch<T = unknown>(path: string, options: ApiOptions = {}): Promise<T> {
  const base = process.env.NEXT_PUBLIC_STRAPI_URL || "";
  const url = path.startsWith("http") ? path : `${base}${path}`;

  const headers: HeadersInit = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (options.locale) {
    (headers as Record<string, string>)["Accept-Language"] = options.locale;
  }

  // 서버 사이드에서만 토큰 주입 (클라이언트 노출 방지)
  if (typeof window === "undefined" && process.env.STRAPI_API_TOKEN) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${process.env.STRAPI_API_TOKEN}`;
  }

  const res = await fetch(url, {
    method: options.method || "GET",
    body: options.body ? JSON.stringify(options.body) : undefined,
    headers,
    cache: options.cache || "no-store",
    next: options.next,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text}`);
  }

  return (await res.json()) as T;
}
