import type { MetadataRoute } from "next";
import { getServerEnv } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  const site = getServerEnv().NEXT_PUBLIC_SITE_URL;
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/account/"],
    },
    sitemap: `${site}/sitemap.xml`,
    host: site,
  };
}
