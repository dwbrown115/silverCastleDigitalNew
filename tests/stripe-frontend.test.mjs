/* eslint-env node */
import test from "node:test";
import assert from "node:assert/strict";
import { canonicalPaymentLink, catalogEndpoint, describeStripePrice, getStripeConfig, listingFromCatalog, loadStripeCatalog } from "../src/stripeCatalog.js";

const paymentLink = "https://buy.stripe.com/test_silverCastleDemo";
const price = { unitAmount: 1900, unitAmountDecimal: "1900", currency: "usd", amountExponent: 2, quantity: 1, adjustableQuantity: false, billingScheme: "per_unit", taxBehavior: "exclusive", recurring: null };
const listing = { paymentLink, status: "available", name: "Synthetic test listing", prices: [price], automaticTax: false, shipping: false, trialDays: null };

test("Stripe configuration permits only hosted Payment Links and explicit local development endpoints", () => {
  assert.equal(canonicalPaymentLink(`${paymentLink}/?utm_source=portfolio#checkout`), paymentLink);
  for (const invalid of [null, "javascript:alert(1)", "http://buy.stripe.com/test_example", "https://buy.stripe.com.evil.test/a", "https://someone@buy.stripe.com/a", "https://buy.stripe.com/a/b", "https://buy.stripe.com:8443/a"]) assert.equal(getStripeConfig({ paymentLink: invalid }), null);
  assert.equal(getStripeConfig(null), null);
  assert.equal(catalogEndpoint("http://127.0.0.1:8787/catalog"), null);
  assert.equal(catalogEndpoint("http://127.0.0.1:8787/catalog", true), "http://127.0.0.1:8787/catalog");
  assert.equal(catalogEndpoint("http://example.com/catalog", true), null);
  assert.equal(catalogEndpoint("https://user:password@example.com/catalog"), null);
});

test("fixed price, quantities, recurrence, tax, trial and shipping disclosures stay accurate", () => {
  assert.equal(describeStripePrice(listing).label, "$19.00");
  const recurring = { ...listing, prices: [{ ...price, quantity: 2, recurring: { interval: "month", intervalCount: 3, usageType: "licensed" } }], trialDays: 14, shipping: true };
  const description = describeStripePrice(recurring);
  assert.equal(description.label, "$38.00 every 3 months for 2");
  assert.match(description.notes.join(" "), /14-day trial/);
  assert.match(description.notes.join(" "), /Tax calculated at checkout/);
  assert.match(description.notes.join(" "), /Shipping calculated at checkout/);
  assert.match(describeStripePrice({ ...listing, prices: [{ ...price, taxBehavior: "inclusive" }] }).notes.join(" "), /Includes tax/);
  assert.equal(describeStripePrice({ ...listing, prices: [{ ...price, adjustableQuantity: null }] }).label, "$19.00 base price");
});

test("Stripe charge exponents handle zero, three decimal and ISK/UGX special cases", () => {
  const format = (currency, unitAmount, amountExponent) => describeStripePrice({ ...listing, prices: [{ ...price, currency, unitAmount, unitAmountDecimal: String(unitAmount), amountExponent }] }).label;
  assert.equal(format("jpy", 1900), "¥1,900");
  assert.equal(format("isk", 1900), "ISK 19.00");
  assert.equal(format("ugx", 1900), "UGX 19.00");
  assert.equal(format("kwd", 1900), "KWD 1.900");
  assert.equal(format("usd", 1900, 2), "$19.00");
});

test("variable, fractional-minor-unit, metered, tiered and compound purchases never invent a total", () => {
  const variablePrices = [
    { customAmount: true, unitAmount: null }, { adjustableQuantity: true }, { transformQuantity: true },
    { billingScheme: "tiered" }, { recurring: { interval: "month", intervalCount: 1, usageType: "metered" } },
    { unitAmountDecimal: "1900.5" }, { unitAmount: null }, { quantity: 0 }, { quantity: Number.MAX_SAFE_INTEGER },
    { recurring: { interval: "fortnight", intervalCount: 1 } }, { currency: "not-a-currency" },
  ];
  for (const variation of variablePrices) assert.equal(describeStripePrice({ ...listing, prices: [{ ...price, ...variation }] }).label, "See pricing at checkout");
  assert.equal(describeStripePrice({ ...listing, prices: [price, price] }).label, "See pricing at checkout");
  assert.equal(describeStripePrice({ ...listing, prices: [] }).label, "See pricing at checkout");
  assert.equal(describeStripePrice({ ...listing, prices: [null] }).label, "See pricing at checkout");
});

test("catalog data cannot redirect checkout or impersonate a different listing", () => {
  assert.deepEqual(listingFromCatalog({ listings: { [paymentLink]: listing } }, paymentLink), { ...listing, description: "" });
  assert.equal(listingFromCatalog({ listings: { [paymentLink]: { ...listing, paymentLink: "https://evil.test/a" } } }, paymentLink), null);
  assert.equal(listingFromCatalog({ listings: { [paymentLink]: { ...listing, status: "unknown" } } }, paymentLink), null);
  assert.equal(listingFromCatalog({ listings: {} }, paymentLink), null);
  assert.equal(listingFromCatalog({ listings: { [paymentLink]: { ...listing, prices: [null] } } }, paymentLink), null);
  assert.equal(listingFromCatalog({ listings: { [paymentLink]: { ...listing, name: { invalid: true } } } }, paymentLink).name, "");
});

test("card and detail fetches share a request; expiry refreshes and failures are retryable", async () => {
  let requests = 0;
  let clock = 0;
  const endpoint = "https://catalog.example.test/catalog";
  const fetcher = async (_url, options) => {
    requests += 1;
    assert.equal(options.credentials, "omit");
    assert.equal(options.cache, "no-store");
    return { ok: true, json: async () => ({ listings: { [paymentLink]: listing } }) };
  };
  const results = await Promise.all([loadStripeCatalog(endpoint, fetcher, () => clock), loadStripeCatalog(endpoint, fetcher, () => clock)]);
  assert.equal(requests, 1);
  assert.equal(results[0], results[1]);
  clock = 30001;
  await loadStripeCatalog(endpoint, fetcher, () => clock);
  assert.equal(requests, 2);
  const failureEndpoint = "https://catalog.example.test/failure";
  await assert.rejects(loadStripeCatalog(failureEndpoint, async () => ({ ok: false })), /unavailable/);
  await loadStripeCatalog(failureEndpoint, fetcher);
  assert.equal(requests, 3);
  await assert.rejects(loadStripeCatalog("https://catalog.example.test/malformed", async () => ({ ok: true, json: async () => ({ listings: [] }) })), /Invalid/);
});
