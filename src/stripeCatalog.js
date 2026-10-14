const catalogs = new Map();
const zeroDecimalCurrencies = new Set("bif clp djf gnf jpy kmf krw mga pyg rwf vnd vuv xaf xof xpf".split(" "));
const threeDecimalCurrencies = new Set(["bhd", "jod", "kwd", "omr", "tnd"]);

export function canonicalPaymentLink(value) {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.hostname !== "buy.stripe.com" || url.port || url.username || url.password || !/^\/[A-Za-z0-9_]+\/?$/.test(url.pathname)) return null;
    return `${url.origin}${url.pathname.replace(/\/$/, "")}`;
  } catch {
    return null;
  }
}

export function getStripeConfig(value) {
  const paymentLink = canonicalPaymentLink(value?.paymentLink);
  if (!paymentLink) return null;
  return { paymentLink, label: typeof value.label === "string" ? value.label.trim().slice(0, 160) : "" };
}

export function catalogEndpoint(value, development = false) {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const url = new URL(value);
    const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
    if (url.username || url.password || (url.protocol !== "https:" && !(development && local && url.protocol === "http:"))) return null;
    return url.href;
  } catch {
    return null;
  }
}

export async function loadStripeCatalog(endpoint, fetcher = globalThis.fetch, now = Date.now) {
  const cached = catalogs.get(endpoint);
  if (cached && cached.expires > now()) return cached.promise;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  const promise = Promise.resolve().then(async () => {
    const response = await fetcher(endpoint, { signal: controller.signal, credentials: "omit", cache: "no-store" });
    if (!response.ok) throw new Error("Stripe catalog unavailable");
    const catalog = await response.json();
    if (!catalog || !catalog.listings || typeof catalog.listings !== "object" || Array.isArray(catalog.listings)) throw new Error("Invalid Stripe catalog");
    return catalog;
  }).finally(() => clearTimeout(timeout));
  catalogs.set(endpoint, { expires: now() + 30000, promise });
  try {
    return await promise;
  } catch (error) {
    catalogs.delete(endpoint);
    throw error;
  }
}

export function listingFromCatalog(catalog, paymentLink) {
  const listing = catalog?.listings?.[paymentLink];
  if (!listing || canonicalPaymentLink(listing.paymentLink) !== paymentLink || !["available", "inactive", "unavailable"].includes(listing.status)) return null;
  if (listing.status === "available" && (!Array.isArray(listing.prices) || listing.prices.some((price) => !price || typeof price !== "object" || Array.isArray(price)))) return null;
  return { ...listing, name: typeof listing.name === "string" ? listing.name.slice(0, 200) : "", description: typeof listing.description === "string" ? listing.description.slice(0, 1000) : "" };
}

function amountExponent(price) {
  if (Number.isInteger(price.amountExponent) && price.amountExponent >= 0 && price.amountExponent <= 3) return price.amountExponent;
  if (["isk", "ugx"].includes(price.currency)) return 2;
  if (zeroDecimalCurrencies.has(price.currency)) return 0;
  return threeDecimalCurrencies.has(price.currency) ? 3 : 2;
}

export function describeStripePrice(listing, locale = "en-US") {
  const prices = listing?.prices;
  const fallback = { label: "See pricing at checkout", notes: [] };
  if (!Array.isArray(prices) || prices.length !== 1) return fallback;
  const price = prices[0];
  if (!price || typeof price !== "object" || Array.isArray(price)) return fallback;
  const recurring = price.recurring;
  if (price.customAmount || price.adjustableQuantity === true || price.transformQuantity || price.billingScheme !== "per_unit" || (recurring && recurring.usageType !== "licensed")) return fallback;
  if (!Number.isSafeInteger(price.unitAmount) || price.unitAmount < 0 || !Number.isSafeInteger(price.quantity) || price.quantity < 1 || !/^[a-z]{3}$/.test(price.currency)) return fallback;
  if (price.unitAmountDecimal != null && Number(price.unitAmountDecimal) !== price.unitAmount) return fallback;
  const total = price.unitAmount * price.quantity;
  if (!Number.isSafeInteger(total)) return fallback;
  const exponent = amountExponent(price);
  let label;
  try {
    label = new Intl.NumberFormat(locale, { style: "currency", currency: price.currency.toUpperCase(), minimumFractionDigits: exponent, maximumFractionDigits: exponent }).format(total / 10 ** exponent);
  } catch {
    return fallback;
  }
  if (recurring) {
    if (!["day", "week", "month", "year"].includes(recurring.interval) || !Number.isSafeInteger(recurring.intervalCount) || recurring.intervalCount < 1) return fallback;
    label += recurring.intervalCount === 1 ? ` / ${recurring.interval}` : ` every ${recurring.intervalCount} ${recurring.interval}s`;
  }
  if (price.quantity > 1) label += ` for ${price.quantity}`;
  if (price.adjustableQuantity !== false) label += " base price";
  const notes = [];
  if (listing.trialDays > 0) notes.push(`${listing.trialDays}-day trial; shown price applies afterward.`);
  if (price.taxBehavior === "inclusive") notes.push("Includes tax.");
  else if (listing.automaticTax || price.taxBehavior === "exclusive") notes.push("Tax calculated at checkout.");
  if (listing.shipping) notes.push("Shipping calculated at checkout.");
  notes.push("Final quantity, price, currency, and any discounts are confirmed on Stripe.");
  return { label, notes };
}
