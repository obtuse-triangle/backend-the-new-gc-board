import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./next-intl.config.js");

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "10.3.0.124",
        port: "1337",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
