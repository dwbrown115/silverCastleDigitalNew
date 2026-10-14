import { readFile } from "node:fs/promises";
import { createCatalogHandler, createStripeReader } from "./catalog.mjs";
import { createManifestReader } from "./manifest.mjs";

const listings = JSON.parse(await readFile(new URL("./listings.json", import.meta.url), "utf8"));
let secret;
let secretExpires = 0;

async function getSecret(signal) {
  if (secret && Date.now() < secretExpires) return secret;
  if (!process.env.STRIPE_SECRET_ARN) throw new Error("Stripe secret is not configured");
  const { SecretsManagerClient, GetSecretValueCommand } = await import("@aws-sdk/client-secrets-manager");
  const client = new SecretsManagerClient({});
  const result = await client.send(new GetSecretValueCommand({ SecretId: process.env.STRIPE_SECRET_ARN }), { abortSignal: signal });
  const value = result.SecretString;
  if (!value) throw new Error("Stripe secret must be a string");
  secret = value.trim().startsWith("{") ? JSON.parse(value).STRIPE_SECRET_KEY : value.trim();
  secretExpires = Date.now() + 300000;
  return secret;
}

export const handler = createCatalogHandler({
  listings,
  loadListings: process.env.STRIPE_LISTINGS_URL ? createManifestReader({ manifestUrl: process.env.STRIPE_LISTINGS_URL }) : undefined,
  readCatalog: createStripeReader({ getSecret }),
});
