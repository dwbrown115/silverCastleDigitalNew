# Shared commerce catalog — frontend contract

Status: local implementation and synthetic verification only. No AWS configuration, Stripe credentials, public project JSON, or live purchase flow was changed for this integration. Do not push this branch to the configured Amplify remote until deployment is authorized.

Silver Castle displays catalog offers and hands visitors to the product's purchase page. Castleaf's existing service remains the sole checkout/order/webhook/payment-verification and in-process fulfillment authority. This frontend never creates Checkout Sessions or grants entitlements, and no service-to-service authentication boundary is introduced.

## Catalog

Configure `VITE_COMMERCE_CATALOG_URL` independently of `VITE_STRIPE_CATALOG_URL`. Production configuration must be an HTTPS URL ending in `/v1/catalog`, without credentials, custom ports, query parameters, or fragments. HTTP loopback is allowed only during development. The request is a public GET with credentials omitted, redirects rejected, and no customer, order, name, capability, or Stripe ID inputs. The service may use `Access-Control-Allow-Origin: *` for this public catalog; that does not authorize order APIs from Silver Castle's origin.

```json
{
  "schema": 1,
  "test": true,
  "purchaseEnabled": false,
  "offers": [{
    "productId": "castleaf-desktop",
    "test": true,
    "purchaseEnabled": false,
    "name": "Castleaf desktop",
    "description": "Synthetic shared-catalog test. No purchase or delivery is offered.",
    "currency": "usd",
    "amount": 123,
    "purchaseUrl": "https://APPROVED-CASTLEAF-HOST/purchase.html?product=castleaf-desktop"
  }]
}
```

`amount` is a positive safe integer in USD cents, so 123 renders as $1.23. The current adapter rejects live catalogs, non-USD currencies, fractional or missing amounts, duplicate IDs, malformed fields, more than 100 offers, and payloads over 64 KiB. Unknown mapped products display unavailable without navigation. The backend must derive offers from its fixed validated product/Price registry, and must never return a client-selected amount or arbitrary Stripe ID lookup.

Per-offer `test` and `purchaseEnabled` are supported in addition to the catalog flags. An explicit disabled offer cannot navigate even when the catalog is enabled. If supplied, `test` must be `true` and `purchaseEnabled` must be boolean. Their absence remains compatible with the original schema-1 contract, which used only catalog-level flags.

## Adapter exports for backend contract tests

The pure ES module is `src/commerceCatalog.js`; import it directly in Node without Vite or React. Its exports are `getCommerceConfig(value)`, `commerceEndpoint(value, development = false)`, `purchasePage(value)`, `validateCommerceCatalog(value)`, `loadCommerceCatalog(endpoint, fetcher = globalThis.fetch, now = Date.now)`, `commerceOfferState(catalog, config, approvedPage, purchasesEnabled = false)`, and `commercePrice(offer)`.

Pass the actual backend response to `validateCommerceCatalog`, then to `commerceOfferState(response, { productId: "castleaf-desktop" }, approvedPurchasePage, false)`. A disabled test offer must retain its validated price while returning `purchaseUrl: null`. Enable-gate contract tests may explicitly pass `true` as the fourth argument and still must get no navigation if either the catalog or selected offer is disabled. This adapter neither calls nor accepts order, customer, or capability APIs.

## Navigation gates

Project JSON uses `"commerce": {"productId": "castleaf-desktop"}`. Cards and deeper dives share the provider; child pages inherit, override, or opt out with `commerce: null`. Existing `stripe` objects continue through the unchanged Payment Link provider. Explicit `commerce` always takes precedence, so do not configure both providers on one project.

`purchaseEnabled: false` displays TEST MODE, product information and pricing, plus noninteractive “Purchases disabled” text. There is no purchase anchor, handler, redirect, or fallback link. Loading, missing, unconfigured, and failure states also have no purchase action. A failed refresh clears displayed details and purchase navigation. Catalog reads coalesce and cache for 30 seconds; visible offers refresh every 30 seconds and when the page becomes visible. The backend must still reject checkout while disabled; cached browser state is not payment authorization.

Future test navigation needs all three independently configured gates: `VITE_COMMERCE_PURCHASES_ENABLED=1`, response `purchaseEnabled: true`, and `VITE_COMMERCE_PURCHASE_PAGE` set to the exact reviewed HTTPS `/purchase.html` URL. The catalog's URL must exactly equal that base URL plus `?product=PRODUCT_ID`; alternate hosts, paths, extra parameters and fragments are rejected. The link navigates in the same tab to the purchase page. Silver Castle does not POST to the order API or carry capabilities across origins. The Castleaf page owns name entry, its same-tab capability storage, checkout creation/idempotency, return handling, and delivery.

The explicit client gate remains off by default, and the development preview forces navigation off even when the other gates are enabled. No real Buy button has been enabled. The current contract has no live mode; adding one needs separate review and real-provider verification.

## Synthetic verification

Run `npm run commerce:fixture`, then in another terminal:

```sh
VITE_COMMERCE_DEMO=1 \
VITE_COMMERCE_CATALOG_URL=http://127.0.0.1:8788/v1/catalog \
VITE_COMMERCE_PURCHASE_PAGE=https://castleaf.example.test/purchase.html \
VITE_COMMERCE_PURCHASES_ENABLED=0 \
npm run dev -- --host 127.0.0.1 --port 5176
```

Open `http://127.0.0.1:5176/__commerce-preview`. It exercises the actual card and deeper-dive offer components with a synthetic $1.23 offer. The remaining examples show loading, missing, unconfigured and failure states. The fixture binds loopback only and makes no Stripe or AWS requests. The preview and synthetic data are excluded from production bundles, static pages and the sitemap even if the demo flag is set during a production build.

Run `npm run test:commerce`, `npm run test:stripe`, `npm run lint`, `npm run build`, and `npm run test:seo`. Tests cover schema/pricing validation, redirect injection, independent enable gates, shared reads/cache expiry, outage recovery, rendered disabled states with zero anchors, child-page inheritance/opt-out, and unchanged legacy Payment Links.

## Verification recorded October 16, 2026

- Contract and rendering PASS: 6 shared-catalog tests, including per-product disable flags, plus 21 legacy Stripe tests.
- Build and indexing PASS: lint, production build with the demo flag set, 10 SEO tests, and whitespace checks. The build contains 17 indexable pages and excludes the preview and synthetic catalog data.
- Responsive behavior PASS: browser previews at 1800px and 390px show the $1.23 fixture without horizontal overflow or purchase links. The preview's return link reaches the portfolio; the fixture has no dead project-detail link.
- Failure states PASS: stopping the loopback fixture removes all displayed prices and purchase links after reload; restarting restores both card and detail prices while retaining zero purchase links.
- Visual consistency PASS: offer components reuse the existing Stripe styles, typography, purple accent, and light-card/dark-detail treatment. No visual assets, product claims, or public projects were added.

These checks use synthetic local data. They do not verify Castleaf's deployed catalog or checkout, and do not authorize a deployment or enable purchases.
