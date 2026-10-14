import { collectListings } from "./catalog.mjs";

export function validateManifest(manifest) {
  if (!Array.isArray(manifest) || manifest.length > 100) throw new Error("Invalid listing manifest");
  for (const listing of manifest) {
    if (!listing || typeof listing !== "object" || Array.isArray(listing) || typeof listing.paymentLink !== "string") throw new Error("Invalid listing manifest");
    if (Object.keys(listing).some((key) => !["paymentLink", "paymentLinkId"].includes(key))) throw new Error("Invalid listing manifest");
    if (Object.hasOwn(listing, "paymentLinkId") && (typeof listing.paymentLinkId !== "string" || !/^plink_[A-Za-z0-9]+$/.test(listing.paymentLinkId))) throw new Error("Invalid listing manifest");
  }
  if (JSON.stringify(manifest, null, 2).length + 1 > 65536) throw new Error("Listing manifest too large");
  return collectListings(manifest.map((stripe) => ({ stripe })));
}

export function createManifestReader({ manifestUrl, fetchImpl = fetch, timeoutMs = 2000 }) {
  const url = new URL(manifestUrl);
  if (url.protocol !== "https:" || url.username || url.password || url.port || url.search || url.hash) throw new Error("Invalid manifest URL");
  return async function readManifest() {
    const controller = new AbortController();
    let onAbort;
    const deadline = new Promise((_resolve, reject) => {
      onAbort = () => reject(new Error("Listing manifest unavailable"));
      controller.signal.addEventListener("abort", onAbort, { once: true });
    });
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const work = (async () => {
        const response = await fetchImpl(url, { method: "GET", redirect: "error", signal: controller.signal, headers: { Accept: "application/json" }, cache: "no-store" });
        if (!response.ok) throw new Error("Listing manifest unavailable");
        const source = await response.text();
        if (source.length > 65536) throw new Error("Listing manifest too large");
        return validateManifest(JSON.parse(source));
      })();
      return await Promise.race([work, deadline]);
    } finally {
      clearTimeout(timer);
      controller.signal.removeEventListener("abort", onAbort);
    }
  };
}
