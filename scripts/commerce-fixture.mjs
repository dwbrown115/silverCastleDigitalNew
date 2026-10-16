import { createServer } from "node:http";

const catalog = { schema: 1, test: true, purchaseEnabled: false, offers: [{ productId: "castleaf-desktop", test: true, purchaseEnabled: false, name: "Castleaf desktop", description: "Synthetic shared-catalog test. No purchase or delivery is offered.", currency: "usd", amount: 123, purchaseUrl: "https://castleaf.example.test/purchase.html?product=castleaf-desktop" }] };
const port = Number(process.env.COMMERCE_FIXTURE_PORT || 8788);
createServer((request, response) => {
  const url = new URL(request.url, "http://127.0.0.1");
  const headers = { "content-type": "application/json", "cache-control": "no-store", "access-control-allow-origin": "*" };
  if (request.method !== "GET") { response.writeHead(405, { ...headers, allow: "GET" }); response.end('{}'); return; }
  if (url.pathname !== "/v1/catalog" || url.search) { response.writeHead(404, headers); response.end('{}'); return; }
  response.writeHead(200, headers);
  response.end(JSON.stringify(catalog));
}).listen(port, "127.0.0.1", () => console.log(`Synthetic shared catalog: http://127.0.0.1:${port}/v1/catalog; purchases disabled; no Stripe connection.`));
