const PAYMENT_LINK_HOST = "buy.stripe.com";
const LINK_ID = /^plink_[A-Za-z0-9]+$/;
// Stripe charge units differ from ISO display decimals for ISK and UGX.
const ZERO_DECIMAL = new Set("bif clp djf gnf jpy kmf krw mga pyg rwf vnd vuv xaf xof xpf".split(" "));
const THREE_DECIMAL = new Set("bhd jod kwd omr tnd".split(" "));

export function amountExponent(currency) {
  return ZERO_DECIMAL.has(currency) ? 0 : THREE_DECIMAL.has(currency) ? 3 : 2;
}

export function normalizePaymentLink(value) {
  if (typeof value !== "string") throw new Error("Invalid payment link");
  const url = new URL(value);
  if (url.protocol !== "https:" || url.hostname !== PAYMENT_LINK_HOST || url.port || url.username || url.password || !/^\/[A-Za-z0-9_]+\/?$/.test(url.pathname)) {
    throw new Error("Use an HTTPS Stripe Payment Link");
  }
  url.search = "";
  url.hash = "";
  url.pathname = url.pathname.replace(/\/$/, "");
  return url.href;
}

export function collectListings(projects) {
  const listings = new Map();
  function visit(value) {
    if (!value || typeof value !== "object") return;
    if (value.stripe) {
      const paymentLink = normalizePaymentLink(value.stripe.paymentLink);
      const paymentLinkId = value.stripe.paymentLinkId;
      if (paymentLinkId && !LINK_ID.test(paymentLinkId)) throw new Error("Invalid Stripe Payment Link ID");
      const existing = listings.get(paymentLink);
      if (existing?.paymentLinkId && paymentLinkId && existing.paymentLinkId !== paymentLinkId) throw new Error("Conflicting Stripe Payment Link IDs");
      const resolvedId = paymentLinkId || existing?.paymentLinkId;
      listings.set(paymentLink, { paymentLink, ...(resolvedId ? { paymentLinkId: resolvedId } : {}) });
    }
    for (const [key, child] of Object.entries(value)) {
      if (key !== "stripe") {
        if (Array.isArray(child)) child.forEach(visit);
        else visit(child);
      }
    }
  }
  projects.forEach(visit);
  return [...listings.values()];
}

function text(value, limit) {
  return typeof value === "string" ? value.slice(0, limit) : "";
}

function image(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password ? url.href : null;
  } catch {
    return null;
  }
}

export function sanitizeListing(link, items, updatedAt) {
  const paymentLink = normalizePaymentLink(link.url);
  if (!link.active) return { status: "inactive", paymentLink, prices: [], updatedAt };
  if (!items.length || items.some((item) => !item.price || typeof item.price !== "object")) throw new Error("Invalid listing prices");
  const products = items.map((item) => typeof item.price.product === "object" && !item.price.product.deleted ? item.price.product : null);
  const first = products.find(Boolean);
  const prices = items.map((item, index) => {
    const price = item.price;
    const recurring = price.recurring;
    const quantity = item.quantity;
    if (!/^[a-z]{3}$/.test(price.currency) || !Number.isSafeInteger(quantity) || quantity < 1) throw new Error("Invalid listing price");
    const unitAmount = Number.isSafeInteger(price.unit_amount) && price.unit_amount >= 0 ? price.unit_amount : null;
    const unitAmountDecimal = typeof price.unit_amount_decimal === "string" && /^\d+(\.\d+)?$/.test(price.unit_amount_decimal) ? price.unit_amount_decimal : null;
    const supportedInterval = recurring && ["day", "week", "month", "year"].includes(recurring.interval);
    return {
      name: text(products[index]?.name || item.description, 200),
      currency: price.currency,
      amountExponent: amountExponent(price.currency),
      unitAmount,
      unitAmountDecimal,
      quantity,
      adjustableQuantity: item.adjustable_quantity?.enabled === true ? true : null,
      recurring: recurring ? {
        interval: supportedInterval ? recurring.interval : null,
        intervalCount: Number.isSafeInteger(recurring.interval_count) && recurring.interval_count > 0 ? recurring.interval_count : null,
        usageType: recurring.usage_type === "metered" ? "metered" : "licensed",
      } : null,
      taxBehavior: ["inclusive", "exclusive"].includes(price.tax_behavior) ? price.tax_behavior : "unspecified",
      customAmount: Boolean(price.custom_unit_amount),
      billingScheme: price.billing_scheme === "per_unit" ? "per_unit" : "tiered",
      transformQuantity: Boolean(price.transform_quantity),
    };
  });
  return {
    status: "available",
    paymentLink,
    name: items.length > 1 ? "Multiple items" : text(first?.name || items[0].description, 200),
    description: items.length === 1 ? text(first?.description, 1000) : "",
    image: image(first?.images?.[0]),
    prices,
    automaticTax: Boolean(link.automatic_tax?.enabled),
    shipping: Boolean(link.shipping_address_collection || link.shipping_options?.length),
    trialDays: Number.isSafeInteger(link.subscription_data?.trial_period_days) && link.subscription_data.trial_period_days > 0 ? link.subscription_data.trial_period_days : null,
    updatedAt,
  };
}

export function createStripeReader({ getSecret, fetchImpl = fetch, timeoutMs = 8000, maxPages = 20 }) {
  return async function readCatalog(config) {
    if (!config.length) return {};
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const bounded = (promise) => {
        if (controller.signal.aborted) return Promise.reject(new Error("Catalog deadline exceeded"));
        let onAbort;
        const deadline = new Promise((_resolve, reject) => {
          onAbort = () => reject(new Error("Catalog deadline exceeded"));
          controller.signal.addEventListener("abort", onAbort, { once: true });
        });
        return Promise.race([promise, deadline]).finally(() => controller.signal.removeEventListener("abort", onAbort));
      };
      const key = await bounded(getSecret(controller.signal));
      if (typeof key !== "string" || !/^(rk|sk)_(live|test)_[A-Za-z0-9]+$/.test(key)) throw new Error("Invalid server configuration");
      const get = async (path, params = {}) => {
        if (controller.signal.aborted) throw new Error("Catalog deadline exceeded");
        const url = new URL(`https://api.stripe.com/v1/${path}`);
        for (const [name, value] of Object.entries(params)) url.searchParams.set(name, value);
        const response = await bounded(fetchImpl(url, {
          method: "GET",
          headers: { Authorization: `Bearer ${key}`, "Stripe-Version": "2024-06-20" },
          signal: controller.signal,
        }));
        if (!response.ok) throw new Error("Stripe catalog unavailable");
        return bounded(response.json());
      };
      const found = new Map();
      const missing = new Set(config.filter((listing) => !listing.paymentLinkId).map((listing) => listing.paymentLink));
      let cursor;
      for (let page = 0; missing.size && page < maxPages; page += 1) {
        const result = await get("payment_links", { limit: "100", ...(cursor ? { starting_after: cursor } : {}) });
        if (!Array.isArray(result.data)) throw new Error("Invalid Stripe catalog");
        for (const link of result.data) {
          let url;
          try { url = normalizePaymentLink(link.url); } catch { continue; }
          if (missing.has(url)) { found.set(url, link); missing.delete(url); }
        }
        if (!result.has_more || !result.data.length) break;
        cursor = result.data.at(-1).id;
        if (!LINK_ID.test(cursor)) throw new Error("Invalid Stripe cursor");
      }
      const entries = [];
      // Sequential requests bound Stripe traffic and share one total request deadline.
      for (const listing of config) {
        try {
          const link = listing.paymentLinkId ? await get(`payment_links/${listing.paymentLinkId}`) : found.get(listing.paymentLink);
          if (!link || !LINK_ID.test(link.id) || normalizePaymentLink(link.url) !== listing.paymentLink) throw new Error("Listing not found");
          const items = [];
          if (link.active) {
            let itemCursor;
            for (let page = 0; page < maxPages; page += 1) {
              const result = await get(`payment_links/${link.id}/line_items`, { limit: "100", "expand[]": "data.price.product", ...(itemCursor ? { starting_after: itemCursor } : {}) });
              if (!Array.isArray(result.data)) throw new Error("Invalid line items");
              items.push(...result.data);
              if (!result.has_more) break;
              itemCursor = result.data.at(-1)?.id;
              if (!itemCursor || page === maxPages - 1) throw new Error("Incomplete listing");
            }
          }
          entries.push([listing.paymentLink, sanitizeListing(link, items, new Date().toISOString())]);
        } catch {
          entries.push([listing.paymentLink, { status: "unavailable", paymentLink: listing.paymentLink, prices: [] }]);
        }
      }
      return Object.fromEntries(entries);
    } finally {
      clearTimeout(timeout);
    }
  };
}

export function createCatalogHandler({ listings = [], loadListings, readCatalog, ttlMs = 60000, now = Date.now }) {
  const config = collectListings(listings.map((stripe) => ({ stripe })));
  let cached;
  let expires = 0;
  let pending;
  return async function handler(event) {
    const method = event.requestContext?.http?.method;
    const path = event.rawPath || "/";
    const headers = { "content-type": "application/json; charset=utf-8", "x-content-type-options": "nosniff" };
    function response(statusCode, payload, cache = "no-store") {
      return { statusCode, headers: { ...headers, "cache-control": cache }, body: JSON.stringify(payload) };
    }
    if (!["/", "/catalog"].includes(path)) return response(404, { error: "Not found" });
    if (method !== "GET") return { ...response(405, { error: "Method not allowed" }), headers: { ...headers, allow: "GET", "cache-control": "no-store" } };
    if (event.rawQueryString) return response(400, { error: "Catalog does not accept query parameters" });
    if (cached && now() < expires) return response(200, cached, "public, max-age=30");
    if (!pending) {
      pending = Promise.resolve().then(async () => {
        const current = loadListings ? collectListings((await loadListings()).map((stripe) => ({ stripe }))) : config;
        return readCatalog(current);
      }).then((catalog) => {
        cached = { listings: catalog, updatedAt: new Date(now()).toISOString() };
        expires = now() + ttlMs;
        return cached;
      }).finally(() => { pending = null; });
    }
    try {
      return response(200, await pending, "public, max-age=30");
    } catch {
      return response(503, { error: "Catalog temporarily unavailable" });
    }
  };
}
