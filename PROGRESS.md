# COMPUTECHS 2.0 — Progress

## Phase 1 — Foundation — DONE
- Next.js App Router + TypeScript + Tailwind 4
- Design tokens (midnight / electric / cyan)
- WooCommerce Store API client + normalizers + WC REST v3 helper
- Env example + local placeholders
- BFF cart/checkout/search/products/webhook routes

## Phase 2 — Shell + homepage — DONE
- Announcement bar, sticky header, mega-menu, footer
- Homepage sections from live Store API (deals, categories, brands, featured)
- Theme + locale switchers (en/ar + RTL)

## Phase 3–4 — Catalog + PDP — DONE
- Shop, category, deals, brands, search, product detail
- Gallery, add to cart, related products, WhatsApp inquiry
- No fabricated reviews

## Phase 5 — Cart — DONE
- Cart-Token/Nonce httpOnly cookies via BFF
- Cart drawer + full cart page + coupons
- Live WooCommerce totals only

## Phase 6 — Guest checkout — DONE (gateway audit partial)
- Guest checkout form + Store API submit
- Payment method from Store API (`whish_by_codnloc`)
- WP-hosted checkout fallback link on failure
- Full WC v3 gateway metadata needs `WC_CONSUMER_KEY` / `WC_CONSUMER_SECRET`

## Phase 7 — Account UI — DONE (auth deferred)
- Account shell + login/register/forgot/orders/addresses/settings UI
- Local wishlist persistence
- Auth architecture documented for next phase

## Phase 8 — Compare / CMS adapters — DONE
- Compare page
- `content/homepage.json` + WordPress content requirements doc

## Phase 9 — i18n / SEO / tests — DONE (baseline)
- next-intl en/ar + RTL
- robots + sitemap
- Vitest normalizer test (passing)
- Playwright smoke spec present (no paid orders)
- `npm run typecheck` and `npm run build` succeeding

## Phase 10 — Deploy — READY FOR STAGING
- README + env docs complete
- Add WC keys in Vercel, deploy staging, then production cutover

## Remaining integrations
1. Add real WC REST credentials to `.env.local`
2. Confirm `whish_by_codnloc` headless compatibility with a test cart (no paid order without permission)
3. Install/authorize dedicated customer auth WP endpoints (later phase)
4. Enrich product attributes in WooCommerce for richer filters/compare
