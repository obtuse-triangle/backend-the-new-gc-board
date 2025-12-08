import type { NextConfig } from "next";

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

export default nextConfig;
