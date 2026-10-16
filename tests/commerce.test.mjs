import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "vite";
import { commerceEndpoint, commerceOfferState, getCommerceConfig, loadCommerceCatalog, purchasePage, validateCommerceCatalog } from "../src/commerceCatalog.js";
import { readProjectListings } from "../server/stripe/project-config.mjs";

const page = "https://castleaf.example.test/purchase.html";
const config = { productId: "castleaf-desktop" };
const offer = { ...config, name: "Castleaf desktop", description: "Synthetic offer", currency: "usd", amount: 123, purchaseUrl: `${page}?product=castleaf-desktop` };
const catalog = { schema: 1, test: true, purchaseEnabled: false, offers: [offer] };

test("commerce configuration separates approved endpoints, stable products, and the purchase page", () => {
  assert.deepEqual(getCommerceConfig(config), { ...config, label: "" });
  for (const productId of ["", "price_123", "../castleaf", "Castleaf", "a".repeat(81)]) assert.equal(getCommerceConfig({ productId }), null);
  assert.equal(commerceEndpoint("https://api.example.test/v1/catalog"), "https://api.example.test/v1/catalog");
  assert.equal(commerceEndpoint("http://127.0.0.1:8788/v1/catalog", true), "http://127.0.0.1:8788/v1/catalog");
  for (const url of ["http://api.example.test/v1/catalog", "https://u:p@api.example.test/v1/catalog", "https://api.example.test/v1/catalog?price=price_1", "https://api.example.test/v1/catalog#x", "https://api.example.test:8443/v1/catalog", "https://api.example.test/orders"]) assert.equal(commerceEndpoint(url), null);
  assert.equal(purchasePage(page), page);
  for (const url of [`${page}?product=castleaf-desktop`, "http://localhost/purchase.html", "https://castleaf.example.test/checkout", "javascript:alert(1)"]) assert.equal(purchasePage(url), null);
});

test("disabled purchases have no navigation even when a product URL exists", () => {
  for (const enabled of [false, true]) {
    const state = commerceOfferState(catalog, config, page, enabled);
    assert.equal(state.offer.amount, 123);
    assert.equal(state.purchaseUrl, null);
  }
  assert.equal(commerceOfferState({ ...catalog, purchaseEnabled: true }, config, page).purchaseUrl, null);
  const disabledProduct = { ...catalog, purchaseEnabled: true, offers: [{ ...offer, test: true, purchaseEnabled: false }] };
  assert.equal(commerceOfferState(disabledProduct, config, page, true).purchaseUrl, null);
  assert.equal(commerceOfferState({ ...disabledProduct, offers: [{ ...offer, test: true, purchaseEnabled: true }] }, config, page, true).purchaseUrl, offer.purchaseUrl);
  assert.equal(commerceOfferState(catalog, { productId: "unknown-product" }, page, true).status, "unavailable");
});

test("navigation needs both enable gates and an exact independent product-bound allowlist", () => {
  const enabled = { ...catalog, purchaseEnabled: true };
  assert.equal(commerceOfferState(enabled, config, page, true).purchaseUrl, offer.purchaseUrl);
  for (const purchaseUrl of ["https://evil.example/purchase.html?product=castleaf-desktop", `${page}?product=other-product`, `${offer.purchaseUrl}&next=https://evil.example/`, `${offer.purchaseUrl}#token`, "javascript:alert(1)", "https://castleaf.example.test@evil.example/purchase.html?product=castleaf-desktop", "https://castleaf.example.test/purchase.html.evil?product=castleaf-desktop"]) {
    assert.equal(commerceOfferState({ ...enabled, offers: [{ ...offer, purchaseUrl }] }, config, page, true).purchaseUrl, null);
  }
  assert.equal(commerceOfferState(enabled, config, undefined, true).purchaseUrl, null);
});

test("catalog schema rejects live, duplicate, fractional, misleading, and oversized offers", () => {
  for (const invalid of [null, {}, { ...catalog, schema: 2 }, { ...catalog, test: false }, { ...catalog, purchaseEnabled: "true" }, { ...catalog, offers: [offer, offer] }, { ...catalog, offers: new Array(101).fill(offer) }]) assert.throws(() => validateCommerceCatalog(invalid));
  for (const variation of [{ test: false }, { purchaseEnabled: "false" }, { purchaseEnabled: null }, { amount: 1.23 }, { amount: -1 }, { amount: 0 }, { amount: Number.MAX_SAFE_INTEGER + 1 }, { amount: "123" }, { currency: "eur" }, { name: "" }, { name: { unsafe: true } }, { description: "x".repeat(1001) }, { productId: "price_1" }]) assert.throws(() => validateCommerceCatalog({ ...catalog, offers: [{ ...offer, ...variation }] }));
  assert.deepEqual(validateCommerceCatalog({ ...catalog, offers: [] }).offers, []);
});

test("shared reads coalesce, refresh disabled state after expiry, and recover after outages", async () => {
  let time = 0, calls = 0, fail = false, current = { ...catalog, purchaseEnabled: true };
  const endpoint = "https://shared-cache.example.test/v1/catalog";
  const fetcher = async (url, options) => {
    assert.equal(url, endpoint);
    assert.equal(options.method, "GET"); assert.equal(options.credentials, "omit"); assert.equal(options.redirect, "error");
    calls += 1;
    if (fail) throw new Error("Offline");
    return { ok: true, text: async () => JSON.stringify(current) };
  };
  const [a, b] = await Promise.all([loadCommerceCatalog(endpoint, fetcher, () => time), loadCommerceCatalog(endpoint, fetcher, () => time)]);
  assert.equal(a, b); assert.equal(calls, 1);
  assert.equal(commerceOfferState(a, config, page, true).purchaseUrl, offer.purchaseUrl);
  time = 30001; current = catalog;
  assert.equal(commerceOfferState(await loadCommerceCatalog(endpoint, fetcher, () => time), config, page, true).purchaseUrl, null);
  time = 60002; fail = true;
  await assert.rejects(loadCommerceCatalog(endpoint, fetcher, () => time), /Offline/);
  fail = false;
  assert.equal((await loadCommerceCatalog(endpoint, fetcher, () => time)).purchaseEnabled, false);
  assert.equal(calls, 4);
  await assert.rejects(loadCommerceCatalog("https://bad.example.test/v1/catalog", async () => ({ ok: true, text: async () => "x".repeat(65537) })), /too large/);
  await assert.rejects(loadCommerceCatalog("https://error.example.test/v1/catalog", async () => ({ ok: false })), /unavailable/);
});

test("rendered cards and deep dives preserve providers and never turn disabled states into links", async () => {
  await mkdir(resolve(".artifacts"), { recursive: true });
  const directory = await mkdtemp(resolve(".artifacts/commerce-render-"));
  try {
    await build({ logLevel: "silent", build: { ssr: "tests/commerce-render-entry.jsx", outDir: directory, emptyOutDir: true } });
    const { renderOffer, renderProjectFixture } = await import(pathToFileURL(resolve(directory, "commerce-render-entry.js")));
    const disabled = renderOffer(config, commerceOfferState(catalog, config, page, true));
    assert.match(disabled, /Castleaf desktop/); assert.match(disabled, /\$1\.23/); assert.match(disabled, /TEST MODE/); assert.match(disabled, /Purchases disabled/); assert.doesNotMatch(disabled, /<a\b/);
    for (const status of ["loading", "error", "unavailable", "unconfigured"]) assert.doesNotMatch(renderOffer(config, { status }), /<a\b|\$1\.23/);
    const enabled = commerceOfferState({ ...catalog, purchaseEnabled: true }, config, page, true);
    assert.match(renderOffer(config, enabled), /href="https:\/\/castleaf.example.test\/purchase.html\?product=castleaf-desktop"/);
    assert.doesNotMatch(renderOffer(config, enabled, true), /<a\b/);
    assert.doesNotMatch(renderOffer(config, { ...enabled, offer: { ...offer, name: "<script>alert(1)</script>" } }), /<script>/);
    const shared = renderProjectFixture({ commerce: config });
    assert.match(shared.card, /Purchases disabled/); assert.match(shared.inherited, /Purchases disabled/); assert.doesNotMatch(shared.hidden, /stripe-offer/);
    const legacy = renderProjectFixture({ stripe: { paymentLink: "https://buy.stripe.com/test_fixture" } });
    assert.match(legacy.card, /href="https:\/\/buy.stripe.com\/test_fixture"/); assert.match(legacy.inherited, /href="https:\/\/buy.stripe.com\/test_fixture"/);
    const publicManifest = await readProjectListings("src/Data/projects");
    assert.deepEqual(publicManifest, []);
  } finally { await rm(directory, { recursive: true, force: true }); }
});
