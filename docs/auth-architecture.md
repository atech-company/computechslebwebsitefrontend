# Customer authentication

Shopper sessions live on the Next.js domain. WooCommerce REST keys stay server-side and are never used as customer credentials.

## Flows

1. **Email register / login** — BFF creates or looks up a WC customer and stores a password hash in customer meta (`_computechs_password`). A signed httpOnly cookie (`computechs_session`) is issued.
2. **Google** — `/api/auth/google` starts OAuth; `/api/auth/google/callback` creates or links the WC customer by email.
3. **Phone** — `/api/auth/phone/send` stores a hashed OTP and sends SMS via Twilio. `/api/auth/phone/verify` creates or logs in the customer. Without Twilio, local development returns the OTP in the JSON body.

## Security

- HTTP-only, Secure (production), SameSite=Lax session cookie
- Rate limits on register, login, and OTP routes
- No secrets in client bundles
- Order history remains customer-scoped and uncached (follow-up)
