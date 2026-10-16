const productPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const cached = new Map();

export function getCommerceConfig(value) {
  if (!value || typeof value.productId !== "string" || value.productId.length > 80 || !productPattern.test(value.productId)) return null;
  return { productId: value.productId, label: typeof value.label === "string" ? value.label.trim().slice(0, 160) : "" };
}

function httpsUrl(value, development) {
  try {
    const url = new URL(value);
    const local = development && ["127.0.0.1", "localhost", "[::1]"].includes(url.hostname);
    if (url.username || url.password || url.search || url.hash || (url.protocol !== "https:" && !(local && url.protocol === "http:")) || (!local && url.port)) return null;
    return url;
  } catch { return null; }
}

export function commerceEndpoint(value, development = false) {
  const url = httpsUrl(value, development);
  return url?.pathname === "/v1/catalog" ? url.href : null;
}

export function purchasePage(value) {
  const url = httpsUrl(value, false);
  return url?.pathname === "/purchase.html" ? url.href : null;
}

export function validateCommerceCatalog(value) {
  if (!value || value.schema !== 1 || value.test !== true || typeof value.purchaseEnabled !== "boolean" || !Array.isArray(value.offers) || value.offers.length > 100) throw new Error("Invalid test catalog");
  const ids = new Set();
  const offers = value.offers.map((offer) => {
    if (!getCommerceConfig(offer) || ids.has(offer.productId) || typeof offer.name !== "string" || !offer.name.trim() || offer.name.length > 200 || typeof offer.description !== "string" || offer.description.length > 1000 || offer.currency !== "usd" || !Number.isSafeInteger(offer.amount) || offer.amount <= 0 || typeof offer.purchaseUrl !== "string" || offer.purchaseUrl.length > 2048) throw new Error("Invalid test offer");
    ids.add(offer.productId);
    if ((Object.hasOwn(offer, "test") && offer.test !== true) || (Object.hasOwn(offer, "purchaseEnabled") && typeof offer.purchaseEnabled !== "boolean")) throw new Error("Invalid test offer flags");
    return { productId: offer.productId, name: offer.name.trim(), description: offer.description, currency: offer.currency, amount: offer.amount, purchaseUrl: offer.purchaseUrl, test: true, purchaseEnabled: offer.purchaseEnabled ?? true };
  });
  return { schema: 1, test: true, purchaseEnabled: value.purchaseEnabled, offers };
}

export async function loadCommerceCatalog(endpoint, fetcher = globalThis.fetch, now = Date.now) {
  const previous = cached.get(endpoint);
  if (previous && previous.expires > now()) return previous.promise;
  const controller = new AbortController();
  let onAbort;
  const deadline = new Promise((_resolve, reject) => {
    onAbort = () => reject(new Error("Catalog timeout"));
    controller.signal.addEventListener("abort", onAbort, { once: true });
  });
  const timer = setTimeout(() => controller.abort(), 8000);
  const promise = Promise.race([Promise.resolve().then(async () => {
    const response = await fetcher(endpoint, { method: "GET", credentials: "omit", redirect: "error", cache: "no-store", signal: controller.signal });
    if (!response.ok) throw new Error("Catalog unavailable");
    const body = await response.text();
    if (body.length > 65536) throw new Error("Catalog too large");
    return validateCommerceCatalog(JSON.parse(body));
  }), deadline]).finally(() => {
    clearTimeout(timer);
    controller.signal.removeEventListener("abort", onAbort);
  });
  const entry = { promise, expires: now() + 30000 };
  cached.set(endpoint, entry);
  try { return await promise; } catch (error) {
    if (cached.get(endpoint) === entry) cached.delete(endpoint);
    throw error;
  }
}

export function commerceOfferState(catalog, config, approvedPage, purchasesEnabled = false) {
  const validated = validateCommerceCatalog(catalog);
  const offer = validated.offers.find((item) => item.productId === config?.productId);
  if (!offer) return { status: "unavailable", offer: null, test: true, purchaseUrl: null };
  let purchaseUrl = null;
  const approved = purchasePage(approvedPage);
  if (purchasesEnabled === true && validated.purchaseEnabled && offer.purchaseEnabled && approved) {
    const expected = new URL(approved);
    expected.searchParams.set("product", config.productId);
    if (offer.purchaseUrl === expected.href) purchaseUrl = expected.href;
  }
  return { status: "ready", offer, test: true, purchaseUrl };
}

export function commercePrice(offer) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(offer.amount / 100);
}
