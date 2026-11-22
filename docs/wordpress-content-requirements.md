# WordPress content requirements (no silent production changes)

The Next.js storefront currently reads catalog data from WooCommerce Store API and campaign copy from `content/homepage.json`.

## Recommended WordPress model (future)

Expose a public REST resource (custom post type or ACF Options page) with:

- `announcement` (string)
- `hero` (product id or slug, headline override, CTA label)
- `promoBanners[]` (title, subtitle, href, image, tone)
- `why[]` (title, description)
- `sectionOrder[]`

Until that exists, edit `content/homepage.json` in the Next.js repo.

## Already available from WooCommerce

- Products, categories, brands, sale flags, images, stock, prices
- Cart / checkout via Store API
- Brands taxonomy: `product_brand` / `/wc/store/v1/products/brands`
