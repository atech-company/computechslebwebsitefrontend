# Checkout / payment gateway audit

## Observed via Store API (no admin keys required)

- Cart `payment_methods`: `["whish_by_codnloc"]`
- Checkout GET works when `Cart-Token` + `Nonce` are present
- Native headless checkout is attempted through `POST /api/checkout` → Store API `/checkout`

## WC REST v3 `/payment_gateways`

Requires `WC_CONSUMER_KEY` and `WC_CONSUMER_SECRET`.

Run after adding credentials:

```ts
import { auditPaymentGateways } from "@/lib/woocommerce/server-rest";
const report = await auditPaymentGateways();
```

## Fallback

If headless submit fails for `whish_by_codnloc`, the checkout UI shows a secure link to:

`https://wp.computechsleb.com/checkout/`

Do not invent payment success. Do not place paid production orders in automated tests without explicit permission.
