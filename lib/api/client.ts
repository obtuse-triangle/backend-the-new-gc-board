type ApiOptions = {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
  locale?: string;
  cache?: RequestCache;
  next?: { revalidate?: number; tags?: string[] };
  authToken?: string;
};

export async function apiFetch<T = unknown>(path: string, options: ApiOptions = {}): Promise<T> {
  const base = process.env.NEXT_PUBLIC_STRAPI_URL || "";
  const url = path.startsWith("http") ? path : `${base}${path}`;

  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;

  const headers: HeadersInit = {
    Accept: "application/json",
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers || {}),
  };

  if (options.locale) {
    (headers as Record<string, string>)["Accept-Language"] = options.locale.trim();
  }

  if (options.authToken) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${options.authToken.trim()}`;
  }

  // 서버 사이드에서만 토큰 주입 (클라이언트 노출 방지)
  if (
    typeof window === "undefined" &&
    process.env.STRAPI_API_TOKEN &&
    !(headers as Record<string, string>)["Authorization"]
  ) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${process.env.STRAPI_API_TOKEN.trim()}`;
  }

  const res = await fetch(url, {
    method: options.method || "GET",
    body: options.body ? (isFormData ? options.body : JSON.stringify(options.body)) : undefined,
    headers,
    cache: options.cache || "no-store",
    next: options.next,
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`[API Error] ${res.status} ${res.statusText} - URL: ${url}`);
    throw new Error(`API ${res.status}: ${text}`);
  }

  if (res.status === 204) {
    return null as T;
  }

  return (await res.json()) as T;
}
