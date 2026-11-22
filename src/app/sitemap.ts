import type { MetadataRoute } from "next";
import { getServerEnv } from "@/lib/env";
import { getProducts, getCategories, getBrands } from "@/lib/woocommerce/products";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = getServerEnv().NEXT_PUBLIC_SITE_URL;
  const staticRoutes = ["", "/shop", "/deals", "/brands", "/about", "/contact"].flatMap(
    (path) =>
      ["en", "ar"].map((locale) => ({
        url: `${site}/${locale}${path}`,
        lastModified: new Date(),
      })),
  );

  try {
    const [products, categories, brands] = await Promise.all([
      getProducts({ perPage: 100 }),
      getCategories({ hideEmpty: true }),
      getBrands(),
    ]);

    const productUrls = products.products.flatMap((p) =>
      ["en", "ar"].map((locale) => ({
        url: `${site}/${locale}/product/${p.slug}`,
        lastModified: new Date(),
      })),
    );
    const categoryUrls = categories.flatMap((c) =>
      ["en", "ar"].map((locale) => ({
        url: `${site}/${locale}/category/${c.slug}`,
        lastModified: new Date(),
      })),
    );
    const brandUrls = brands.flatMap((b) =>
      ["en", "ar"].map((locale) => ({
        url: `${site}/${locale}/brands/${b.slug}`,
        lastModified: new Date(),
      })),
    );

    return [...staticRoutes, ...productUrls, ...categoryUrls, ...brandUrls];
  } catch {
    return staticRoutes;
  }
}
