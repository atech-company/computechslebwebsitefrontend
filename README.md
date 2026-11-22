# Computechs 2.0 Storefront

Premium Next.js storefront for [computechsleb.com](https://computechsleb.com), connected to the live WooCommerce backend at [wp.computechsleb.com](https://wp.computechsleb.com).

## Architecture

- **Catalog**: Server Components fetch WooCommerce Store API (ISR/revalidate).
- **Cart / checkout**: Browser → Next.js Route Handlers (BFF) → Store API with `Cart-Token` + `Nonce` httpOnly cookies (required because WP CORS has no `Access-Control-Allow-Origin`).
- **Admin REST v3**: server-only consumer key/secret for gateway audit and future order history.
- **Accounts**: UI ready; auth deferred (see `docs/auth-architecture.md`).

## Setup

```bash
npm install
cp .env.example .env.local
# Add WC_CONSUMER_KEY / WC_CONSUMER_SECRET when available
npm run dev
```

Open [http://localhost:3000/en](http://localhost:3000/en).

## Environment

| Variable | Purpose |
|----------|---------|
| `WOOCOMMERCE_URL` | `https://wp.computechsleb.com` |
| `NEXT_PUBLIC_SITE_URL` | Storefront URL |
| `WC_CONSUMER_KEY` / `WC_CONSUMER_SECRET` | Server-only WC REST v3 |
| `WC_WEBHOOK_SECRET` | Cache revalidation webhook |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | WhatsApp inquiry |

## Scripts

- `npm run dev` — development server
- `npm run build` / `npm start` — production
- `npm run typecheck` — TypeScript
- `npm run lint` — ESLint
- `npm test` — Vitest unit tests
- `npx playwright test` — browser smoke tests (start `npm run dev` first)

## Docs

- `PROGRESS.md` — phase status
- `docs/auth-architecture.md`
- `docs/checkout-gateway-audit.md`
- `docs/wordpress-content-requirements.md`

## Deploy (Vercel)

1. Set environment variables in Vercel
2. Deploy staging first
3. Point `computechsleb.com` after full journey testing
4. Configure WooCommerce webhook to `/api/webhooks/woocommerce` for catalog revalidation

Do not modify the live WordPress database without authorization.
