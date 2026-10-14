import { createServer } from "node:http";
import { createCatalogHandler, sanitizeListing } from "../server/stripe/catalog.mjs";

const paymentLink = "https://buy.stripe.com/test_silverCastleDemo";
const listing = sanitizeListing({ url: paymentLink, active: true, automatic_tax: { enabled: false } }, [{
  quantity: 1,
  price: { currency: "usd", unit_amount: 1900, unit_amount_decimal: "1900", billing_scheme: "per_unit", tax_behavior: "exclusive", recurring: null,
    product: { name: "Synthetic test listing", description: "Local test data only. No real product or checkout is connected.", images: [] } },
}], new Date().toISOString());
const handler = createCatalogHandler({ listings: [{ paymentLink }], readCatalog: async () => ({ [paymentLink]: listing }) });
const port = Number(process.env.STRIPE_FIXTURE_PORT || 8787);
createServer(async (request, response) => {
  const url = new URL(request.url, "http://127.0.0.1");
  const origin = request.headers.origin;
  if (origin && /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) response.setHeader("access-control-allow-origin", origin);
  response.setHeader("vary", "Origin");
  const result = await handler({ rawPath: url.pathname, rawQueryString: url.search.slice(1), requestContext: { http: { method: request.method } } });
  response.writeHead(result.statusCode, result.headers);
  response.end(result.body);
}).listen(port, "127.0.0.1", () => {
  console.log(`Synthetic Stripe catalog: http://127.0.0.1:${port}/catalog`);
  console.log("Local fixture only; no Stripe API or payment requests are made.");
});
