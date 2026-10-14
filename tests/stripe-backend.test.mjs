import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { collectListings, normalizePaymentLink, sanitizeListing, createStripeReader, createCatalogHandler, amountExponent } from "../server/stripe/catalog.mjs";
import { createManifestReader, validateManifest } from "../server/stripe/manifest.mjs";
import { readProjectListings } from "../server/stripe/project-config.mjs";

const url = "https://buy.stripe.com/test_example";
const id = "plink_Example";
const link = { id, url, active: true, automatic_tax: { enabled: true }, metadata: { private: "never expose" } };
const item = { id: "li_First", quantity: 1, price: { unit_amount: 1900, unit_amount_decimal: "1900", currency: "usd", billing_scheme: "per_unit", tax_behavior: "exclusive", product: { name: "Test listing", description: "Description", images: ["https://example.com/item.png"], metadata: { private: "never expose" } } } };
const event = { rawPath: "/catalog", rawQueryString: "", requestContext: { http: { method: "GET" } } };
const reply = (value) => ({ ok: true, json: async () => value });

test("allowlist normalizes and collects optional nested listing links; rejects unsafe URLs and conflicting IDs", () => {
  assert.equal(normalizePaymentLink(`${url}/?tracking=1#x`), url);
  for (const unsafe of ["http://buy.stripe.com/a", "https://buy.stripe.com.evil.com/a", "https://user@buy.stripe.com/a", "https://buy.stripe.com:444/a", "javascript:alert(1)", "https://buy.stripe.com/a/b"]) {
    assert.throws(() => normalizePaymentLink(unsafe));
  }
  const projects = [{ stripe: { paymentLink: url }, overview: [{ stripe: { paymentLink: `${url}?x=1`, paymentLinkId: id } }], pages: [{ stripe: { paymentLink: "https://buy.stripe.com/other" } }] }];
  assert.deepEqual(collectListings(projects), [{ paymentLink: url, paymentLinkId: id }, { paymentLink: "https://buy.stripe.com/other" }]);
  assert.throws(() => collectListings([{ stripe: { paymentLink: url, paymentLinkId: "plink_A" } }, { stripe: { paymentLink: url, paymentLinkId: "plink_B" } }]));
});

test("public listing contains only product/price fields and handles Stripe charge currency exceptions", () => {
  const result = sanitizeListing(link, [item], "now");
  assert.equal(result.name, "Test listing");
  assert.equal(result.prices[0].unitAmount, 1900);
  assert.equal(result.automaticTax, true);
  assert.equal(result.prices[0].adjustableQuantity, null);
  assert.equal(JSON.stringify(result).includes("metadata"), false);
  assert.equal(JSON.stringify(result).includes("never expose"), false);
  for (const [currency, exponent] of [["usd", 2], ["jpy", 0], ["bif", 0], ["isk", 2], ["ugx", 2], ["huf", 2], ["twd", 2], ["kwd", 3]]) assert.equal(amountExponent(currency), exponent);
  const custom = sanitizeListing(link, [{ ...item, adjustable_quantity: { enabled: true }, price: { ...item.price, unit_amount: null, unit_amount_decimal: null, custom_unit_amount: { enabled: true }, recurring: { interval: "month", interval_count: 2, usage_type: "metered" }, transform_quantity: { divide_by: 100 } } }], "now");
  assert.equal(custom.prices[0].customAmount, true);
  assert.equal(custom.prices[0].unitAmount, null);
  assert.equal(custom.prices[0].transformQuantity, true);
  assert.equal(custom.prices[0].recurring.intervalCount, 2);
  const insecureImage = sanitizeListing(link, [{ ...item, price: { ...item.price, product: { ...item.price.product, images: ["javascript:alert(1)"] } } }], "now");
  assert.equal(insecureImage.image, null);
  assert.deepEqual(sanitizeListing({ ...link, active: false }, [], "now"), { status: "inactive", paymentLink: url, prices: [], updatedAt: "now" });
});

test("URL resolver paginates payment links, and line-item reader never truncates a listing", async () => {
  const requests = [];
  const reader = createStripeReader({ getSecret: async () => "rk_test_Example", fetchImpl: async (requestUrl, options) => {
    requests.push([requestUrl, options]);
    if (requestUrl.pathname.endsWith("/line_items")) {
      assert.equal(requestUrl.searchParams.get("expand[]"), "data.price.product");
      return requestUrl.searchParams.has("starting_after") ? reply({ data: [{ ...item, id: "li_Last" }], has_more: false }) : reply({ data: [item], has_more: true });
    }
    return requestUrl.searchParams.has("starting_after") ? reply({ data: [link], has_more: false }) : reply({ data: [{ id: "plink_Other", url: "https://buy.stripe.com/other" }], has_more: true });
  } });
  const result = await reader([{ paymentLink: url }]);
  assert.equal(result[url].prices.length, 2);
  assert.equal(requests.length, 4);
  for (const [requestUrl, options] of requests) {
    assert.equal(requestUrl.origin, "https://api.stripe.com");
    assert.equal(options.method, "GET");
    assert.equal(options.headers.Authorization, "Bearer rk_test_Example");
    assert.match(requestUrl.pathname, /^\/v1\/payment_links/);
  }
});

test("provided paymentLinkId avoids account listing but must match configured checkout URL", async () => {
  const requests = [];
  const reader = createStripeReader({ getSecret: async () => "rk_test_Example", fetchImpl: async (requestUrl) => {
    requests.push(requestUrl.pathname);
    return requestUrl.pathname.endsWith("/line_items") ? reply({ data: [item], has_more: false }) : reply(link);
  } });
  assert.equal((await reader([{ paymentLink: url, paymentLinkId: id }]))[url].status, "available");
  assert.deepEqual(requests, [`/v1/payment_links/${id}`, `/v1/payment_links/${id}/line_items`]);
  assert.equal((await reader([{ paymentLink: "https://buy.stripe.com/wrong", paymentLinkId: id }]))["https://buy.stripe.com/wrong"].status, "unavailable");
});

test("pagination limit and failed line items produce unavailable without misleading partial price", async () => {
  const reader = createStripeReader({ getSecret: async () => "rk_test_Example", maxPages: 1, fetchImpl: async (requestUrl) => requestUrl.pathname.endsWith("/line_items") ? reply({ data: [item], has_more: true }) : reply(link) });
  const result = await reader([{ paymentLink: url, paymentLinkId: id }]);
  assert.deepEqual(result[url], { status: "unavailable", paymentLink: url, prices: [] });
});

test("catalog cache coalesces requests and refreshes after TTL; expiry never serves stale price after failure", async () => {
  let time = 1000;
  let count = 0;
  let reject = false;
  const handler = createCatalogHandler({ listings: [{ paymentLink: url }], now: () => time, ttlMs: 60, readCatalog: async (config) => {
    count += 1;
    assert.equal(config.length, 1);
    if (reject) throw new Error("secret key and private Stripe details");
    await Promise.resolve();
    return { [url]: sanitizeListing(link, [item], "now") };
  } });
  const responses = await Promise.all([handler(event), handler(event)]);
  assert.equal(count, 1);
  assert.deepEqual(responses[0], responses[1]);
  await handler(event);
  assert.equal(count, 1);
  time += 61;
  reject = true;
  const failed = await handler(event);
  assert.equal(failed.statusCode, 503);
  assert.equal(failed.headers["cache-control"], "no-store");
  assert.deepEqual(JSON.parse(failed.body), { error: "Catalog temporarily unavailable" });
  assert.equal(count, 2);
});

test("empty allowlist needs no credentials, methods and arbitrary input cannot invoke Stripe", async () => {
  let secretReads = 0;
  const handler = createCatalogHandler({ listings: [], readCatalog: createStripeReader({ getSecret: async () => { secretReads += 1; throw new Error("missing secret"); } }) });
  assert.equal((await handler(event)).statusCode, 200);
  assert.equal(secretReads, 0);
  assert.equal((await handler({ ...event, rawQueryString: "paymentLinkId=plink_Private" })).statusCode, 400);
  assert.equal((await handler({ ...event, rawPath: "/customers" })).statusCode, 404);
  assert.equal((await handler({ ...event, requestContext: { http: { method: "POST" } } })).statusCode, 405);
  assert.equal(secretReads, 0);
});

test("Stripe deadline aborts request and never returns secret or raw errors", async () => {
  const handler = createCatalogHandler({ listings: [{ paymentLink: url, paymentLinkId: id }], readCatalog: createStripeReader({ timeoutMs: 10, getSecret: async () => "rk_test_Example", fetchImpl: async (_url, { signal }) => new Promise((_resolve, reject) => { signal.addEventListener("abort", () => reject(new Error("sensitive raw Stripe failure")), { once: true }); }) }) });
  const result = await handler(event);
  assert.equal(JSON.parse(result.body).listings[url].status, "unavailable");
  assert.equal(result.body.includes("rk_test"), false);
  assert.equal(result.body.includes("sensitive"), false);
});

test("secret loading has a deadline even if an adapter ignores the abort signal", async () => {
  const handler = createCatalogHandler({ listings: [{ paymentLink: url }], readCatalog: createStripeReader({ timeoutMs: 10, getSecret: async () => new Promise(() => {}) }) });
  const started = Date.now();
  const result = await handler(event);
  assert.equal(result.statusCode, 503);
  assert.ok(Date.now() - started < 1000);
  assert.equal(result.body.includes("secret"), false);
});

test("a failed listing does not hide other allowlisted listings; archive changes refresh after cache expiry", async () => {
  const otherUrl = "https://buy.stripe.com/other";
  let active = true;
  let time = 1000;
  const reader = createStripeReader({ getSecret: async () => "rk_test_Example", fetchImpl: async (requestUrl) => {
    if (requestUrl.pathname.includes("plink_Failed")) return { ok: false, json: async () => ({ error: "do not leak" }) };
    if (requestUrl.pathname.endsWith("/line_items")) return reply({ data: [item], has_more: false });
    return reply({ ...link, active });
  } });
  const handler = createCatalogHandler({ listings: [{ paymentLink: url, paymentLinkId: id }, { paymentLink: otherUrl, paymentLinkId: "plink_Failed" }], readCatalog: reader, now: () => time, ttlMs: 60 });
  const first = JSON.parse((await handler(event)).body);
  assert.equal(first.listings[url].status, "available");
  assert.equal(first.listings[otherUrl].status, "unavailable");
  active = false;
  time += 61;
  const next = JSON.parse((await handler(event)).body);
  assert.equal(next.listings[url].status, "inactive");
  assert.deepEqual(next.listings[url].prices, []);
});

test("CloudFormation grants exact secret read and both URL-only public invocation permissions", async () => {
  const template = JSON.parse(await readFile(new URL("../server/stripe/template.json", import.meta.url), "utf8"));
  const resources = template.Resources;
  const secret = resources.CatalogRole.Properties.Policies[0].PolicyDocument.Statement[0];
  assert.equal(secret.Action, "secretsmanager:GetSecretValue");
  assert.deepEqual(secret.Resource, { Ref: "StripeSecretArn" });
  assert.equal(resources.CatalogUrl.Properties.AuthType, "NONE");
  assert.deepEqual(resources.CatalogUrl.Properties.Cors.AllowMethods, ["GET"]);
  assert.equal(resources.CatalogInvokePermission.Properties.InvokedViaFunctionUrl, true);
  assert.equal(resources.CatalogUrlPermission.Properties.FunctionUrlAuthType, "NONE");
  assert.equal(resources.CatalogFunction.Properties.Runtime, "nodejs22.x");
  assert.equal(template.Parameters.ListingsUrl.Default, "https://www.silvercastledigital.com/stripe-listings.json");
  assert.deepEqual(resources.CatalogFunction.Properties.Environment.Variables.STRIPE_LISTINGS_URL, { Ref: "ListingsUrl" });
});

test("dynamic trusted manifest adds and removes listings at cache expiry without redeploying backend", async () => {
  const otherUrl = "https://buy.stripe.com/new";
  let manifest = [{ paymentLink: url, paymentLinkId: id }];
  let time = 1000;
  let manifestReads = 0;
  const loadListings = createManifestReader({ manifestUrl: "https://www.silvercastledigital.com/stripe-listings.json", fetchImpl: async (requestUrl, options) => {
    manifestReads += 1;
    assert.equal(requestUrl.href, "https://www.silvercastledigital.com/stripe-listings.json");
    assert.equal(options.method, "GET");
    assert.equal(options.redirect, "error");
    assert.equal(options.headers.Authorization, undefined);
    return { ok: true, text: async () => JSON.stringify(manifest) };
  } });
  const handler = createCatalogHandler({ listings: [{ paymentLink: "https://buy.stripe.com/oldPackaged" }], loadListings, ttlMs: 60, now: () => time,
    readCatalog: async (config) => Object.fromEntries(config.map((listing) => [listing.paymentLink, { status: "inactive", paymentLink: listing.paymentLink, prices: [] }])) });
  const responses = await Promise.all([handler(event), handler(event)]);
  assert.deepEqual(Object.keys(JSON.parse(responses[0].body).listings), [url]);
  assert.equal(manifestReads, 1);
  manifest = [{ paymentLink: otherUrl }];
  time += 61;
  assert.deepEqual(Object.keys(JSON.parse((await handler(event)).body).listings), [otherUrl]);
  manifest = [];
  time += 61;
  assert.deepEqual(JSON.parse((await handler(event)).body).listings, {});
});

test("failed or malformed manifest returns 503 without stale prices, packaged fallback, or Stripe calls", async () => {
  let time = 1000;
  let body = JSON.stringify([{ paymentLink: url }]);
  let stripeReads = 0;
  const loadListings = createManifestReader({ manifestUrl: "https://www.silvercastledigital.com/stripe-listings.json", fetchImpl: async () => ({ ok: true, text: async () => body }) });
  const handler = createCatalogHandler({ listings: [{ paymentLink: url }], loadListings, ttlMs: 60, now: () => time, readCatalog: async () => {
    stripeReads += 1;
    return { [url]: sanitizeListing(link, [item], "now") };
  } });
  assert.equal((await handler(event)).statusCode, 200);
  time += 61;
  body = JSON.stringify([{ paymentLink: url, secretKey: "must not reach public catalog" }]);
  const failed = await handler(event);
  assert.equal(failed.statusCode, 503);
  assert.equal(stripeReads, 1);
  assert.equal(failed.body.includes("1900"), false);
  assert.equal(failed.body.includes("secretKey"), false);
  for (const malformed of [null, {}, [null], [url], [{ paymentLink: "https://evil.com/path" }], [{ paymentLink: url, paymentLinkId: "" }], [{ paymentLink: url, paymentLinkId: "plink_A" }, { paymentLink: url, paymentLinkId: "plink_B" }]]) assert.throws(() => validateManifest(malformed));
  assert.throws(() => validateManifest(Array.from({ length: 101 }, () => ({ paymentLink: url }))));
  assert.throws(() => validateManifest([{ paymentLink: `https://buy.stripe.com/${"a".repeat(65536)}` }]));
  const unavailable = createCatalogHandler({ listings: [{ paymentLink: url }], loadListings: createManifestReader({ manifestUrl: "https://www.silvercastledigital.com/stripe-listings.json", fetchImpl: async () => ({ ok: false }) }), readCatalog: async () => { throw new Error("must not execute"); } });
  assert.equal((await unavailable(event)).statusCode, 503);
});

test("manifest network and body parsing deadlines are bounded even if fetch ignores abort", async () => {
  for (const fetchImpl of [async () => new Promise(() => {}), async () => ({ ok: true, text: async () => new Promise(() => {}) })]) {
    const loadListings = createManifestReader({ manifestUrl: "https://www.silvercastledigital.com/stripe-listings.json", fetchImpl, timeoutMs: 10 });
    const handler = createCatalogHandler({ loadListings, readCatalog: async () => { throw new Error("must not execute"); } });
    const started = Date.now();
    assert.equal((await handler(event)).statusCode, 503);
    assert.ok(Date.now() - started < 1000);
  }
  assert.throws(() => createManifestReader({ manifestUrl: "http://example.com/listings.json" }));
  assert.throws(() => createManifestReader({ manifestUrl: "https://user@example.com/listings.json" }));
  assert.throws(() => createManifestReader({ manifestUrl: "https://example.com/listings.json?url=arbitrary" }));
});

test("project build helper publishes only normalized listing URLs and optional IDs", async () => {
  const listings = await readProjectListings(new URL("../src/Data/projects", import.meta.url).pathname);
  assert.deepEqual(validateManifest(JSON.parse(JSON.stringify(listings))), listings);
  for (const listing of listings) assert.ok(Object.keys(JSON.parse(JSON.stringify(listing))).every((key) => ["paymentLink", "paymentLinkId"].includes(key)));
});
