# Customer authentication (next phase)

## Current state (Option C)

- Guest checkout works via Store API + Cart-Token cookies.
- Wishlist/compare/recently viewed persist in localStorage.
- Account UI is complete but login/register are intentionally disabled.

## Next-phase design

1. Add **dedicated customer authentication endpoints** on WordPress (narrowly scoped plugin or custom REST routes). Do **not** use:
   - Administrator REST keys as customer credentials
   - WordPress Application Passwords as shopper login
2. Next.js BFF routes under `/api/auth/*` exchange credentials server-side.
3. Issue an **HTTP-only, Secure, SameSite=Lax** session cookie from the Next.js domain.
4. Authenticated order history uses customer-scoped WordPress/WooCommerce APIs with that session — never public cache.
5. Optional: sync local wishlist to a customer meta endpoint after login.

## Security requirements

- CSRF protection on mutating auth routes
- Rate limiting on login
- No secrets in client bundles
- Authorization checks before returning any order payload
