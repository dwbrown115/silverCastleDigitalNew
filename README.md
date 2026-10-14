# Silver Castle Digital

The current Silver Castle Digital portfolio and independent software practice website.

This React/Vite site presents active projects, earlier work, the agentic building approach, and a contact form. It retains the castle mark, indigo/blue identity, original portfolio records, social links, and EmailJS integration from the latest site while updating the design and current positioning.

## Development

Install dependencies with `npm install`, start the local site with `npm run dev`, and create a production build with `npm run build`.

## Search and sharing

The build renders the homepage and every project and deeper-dive page to static HTML, using the same React components and JSON content as the interactive site. The browser hydrates that HTML and maintains page metadata when navigating between projects.

Titles, descriptions, canonical URLs, Open Graph and Twitter previews, and JSON-LD are generated in `src/seo.js`. The canonical host is `https://www.silvercastledigital.com`. The build also generates `sitemap.xml`, `robots.txt`, and a noindex 404 page. The standalone KJR privacy policy retains its content and layout and receives matching metadata.

Both `route.html` and `route/index.html` are emitted for Amplify's clean URL handling. Do not add a blanket 200 rewrite to `/index.html`: it would replace page-specific HTML with the homepage. Keep a 404 fallback for genuinely missing files. The `_redirects` file is for other static hosts; Amplify redirect rules are managed in its hosting settings.

`hosting/amplify-redirects.json` contains the recommended permanent redirect from the apex domain to the canonical `www` host and a missing-file fallback to the generated `/404.html`. It is a reference for the Amplify console, not configuration applied by the build. Review the current hosting rules before merging these entries, preserve any other required rules, and place the 404 fallback last. Amplify appends the requested path to domain-only redirect targets and applies a 404 fallback only when a file is missing. See the [AWS redirect examples](https://docs.aws.amazon.com/amplify/latest/userguide/redirect-rewrite-examples.html).

Adding a project JSON automatically adds its main page and child pages to the static build and sitemap. Add its slug to `projectOrder` in `src/Sections/Projects/index.jsx` to show it on the homepage. An optional `seoDescription` can override the introductory text used for a search snippet.

Run `npm run build && npm run test:seo` to check generated page content, canonical URLs, structured data, sitemap coverage, image paths, safe metadata escaping, unknown-route rendering, the recommended hosting rules, and preservation of the policy body. React 18 uses the lowercase `fetchpriority` attribute to prioritize the homepage hero image.

## Contact form

The contact form uses these environment variables when configured:

- `VITE_EMAILJS_SERVICE_ID`
- `VITE_EMAILJS_TEMPLATE_ID`
- `VITE_EMAILJS_PUBLIC_KEY`

Without them, submitting opens a prefilled email to `dakota.w.brown@silvercastledigital.com`.

## Stripe listings

Project JSON can optionally include a `stripe` object with a Stripe Payment Link. The same listing appears on the homepage card and project page; child pages inherit it unless they specify `stripe: null` or another listing. See `src/Data/projects/SCHEMA.md` for the fields. Existing projects without a listing do not change.

The browser reads product details and pricing from `VITE_STRIPE_CATALOG_URL`. The server retrieves the configured Payment Links and their line items from Stripe, publishes only product and pricing details, and caches them briefly. No API key is sent to the browser. Purchases happen on the existing Stripe-hosted Payment Link; this integration does not create charges, collect card details, or fulfil purchases.

Fixed prices include currency and billing frequency. Variable amounts, tiered pricing, and usage-based billing defer to checkout rather than displaying a misleading total. A failed lookup removes the price and lets visitors check the configured Payment Link; an inactive listing has no purchase action. Tax, shipping, quantity choices, and the final total are confirmed at checkout.

### Local synthetic preview

Run `npm run stripe:fixture` in one terminal, then run the following in another:

```sh
VITE_STRIPE_DEMO=1 VITE_STRIPE_CATALOG_URL=http://127.0.0.1:8787/catalog npm run dev
```

Open `/__stripe-preview` at the local Vite address. The preview is explicitly labeled synthetic, and checkout is disabled. It exercises the offer component without changing real project JSON or contacting Stripe. The preview route is available only during development with the explicit flag; it is excluded from production pages and the sitemap.

### Activate a real listing later

1. Create or select a Stripe Payment Link and add its URL to the project's `stripe` object. An optional matching `paymentLinkId` avoids searching the account's links.
2. Store a Stripe restricted API key in an existing AWS Secrets Manager secret encrypted with the AWS-managed Secrets Manager key. It needs read access to Payment Links, Prices, and Products, and no customer, payment, or write permissions. The secret can be the plain key or JSON containing `STRIPE_SECRET_KEY`. Never use a `VITE_*` variable for this key.
3. Run `npm run stripe:package`. This produces `.artifacts/stripe/stripe-catalog.zip` without API keys. The website build generates `stripe-listings.json` from project JSON, containing only the selected Payment Link URLs and optional IDs. The catalog reads that manifest, so adding or removing a listing uses the normal website rebuild without another backend deployment. Editing a product's price or description in Stripe does not require rebuilding the website.
4. Upload the archive under a new versioned key in an existing S3 bucket in the deployment region. Deploy `server/stripe/template.json` through CloudFormation with the bucket/key, the exact existing secret ARN, and the frontend origin. The template creates a public, read-only Lambda catalog endpoint and a role that can read only that secret. CORS controls browser access; the catalog itself is public and contains only the listings you selected for publication.
5. Set `VITE_STRIPE_CATALOG_URL` in Amplify to the stack's `CatalogEndpoint` output and rebuild the frontend.

The server caches catalog data for 60 seconds, and visible offers refresh every 30 seconds. Price changes can therefore take about 90 seconds to appear. The endpoint accepts only GET requests to `/catalog` or `/`, with no lookup parameters; visitors cannot request arbitrary Stripe IDs. API errors do not expose Stripe responses or secrets. If the website manifest cannot be loaded or validated, the service returns an error rather than serving old prices or an outdated list of products.

The current integration uses synthetic data for verification. No live listing, key, backend stack, or real checkout has been connected. Run `npm run test:stripe` for the catalog and price-display checks, and keep the SEO build checks when changing project data.
