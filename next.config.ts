import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    // Next's optimizer fetches WP as a server; Hostinger WAF 403s those
    // requests and ties up Node workers until the proxy returns 504/503.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "wp.computechsleb.com",
        pathname: "/wp-content/uploads/**",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
