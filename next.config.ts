import type { NextConfig } from "next";
import type { RemotePattern } from "next/dist/shared/lib/image-config";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./next-intl.config.js");

const remotePatterns: RemotePattern[] = [
  {
    protocol: "http",
    hostname: "10.3.0.124",
    port: "1337",
    pathname: "/uploads/**",
  },
];

const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL;
if (strapiUrl) {
  try {
    const parsed = new URL(strapiUrl);
    remotePatterns?.push({
      protocol: parsed.protocol.replace(":", "") as "http" | "https",
      hostname: parsed.hostname,
      port: parsed.port || undefined,
      pathname: "/**",
    });
  } catch {
    // ignore invalid URL
  }
}

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowLocalIP: true,
    remotePatterns,
  },
};

export default withNextIntl(nextConfig);
