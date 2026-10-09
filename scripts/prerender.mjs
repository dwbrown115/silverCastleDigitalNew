import { build } from "vite";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { SITE_ORIGIN, escapeHtml, getPageSeo, renderSeoHead } from "../src/seo.js";

const root = fileURLToPath(new URL("../", import.meta.url));
const dist = path.join(root, "dist");
const serverDist = path.join(root, "dist-ssr");
const shell = await readFile(path.join(dist, "index.html"), "utf8");

try {
  await build({
    root,
    build: { ssr: "src/entry-server.jsx", outDir: serverDist, emptyOutDir: true },
    logLevel: "warn",
  });
  const { routes, renderPage } = await import(pathToFileURL(path.join(serverDist, "entry-server.js")));
  for (const route of routes) {
    if (route === "/privacy/kitten-jump") continue;
    const { html, head } = renderPage(route);
    const document = shell
      .replace(/<!-- seo:start -->[\s\S]*?<!-- seo:end -->/, () => `<!-- seo:start -->\n    ${head}\n    <!-- seo:end -->`)
      .replace('<div id="root"></div>', () => `<div id="root" data-route="${escapeHtml(route)}">${html}</div>`);
    const directory = path.join(dist, route.slice(1));
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, "index.html"), document);
    if (route !== "/") await writeFile(path.join(dist, `${route.slice(1)}.html`), document);
  }

  const privacyPath = path.join(dist, "privacy/kitten-jump/index.html");
  const privacy = await readFile(privacyPath, "utf8");
  const privacyHead = renderSeoHead(getPageSeo("/privacy/kitten-jump", {}));
  const privacyDocument = privacy.replace(/\s*<meta name="description"[^>]*>/, "").replace(/\s*<title>[\s\S]*?<\/title>/, "")
    .replace("</head>", `    ${privacyHead}\n  </head>`);
  await writeFile(privacyPath, privacyDocument);
  await writeFile(path.join(dist, "privacy/kitten-jump.html"), privacyDocument);

  const notFound = renderPage("/not-found");
  const errorDocument = shell.replace(/<!-- seo:start -->[\s\S]*?<!-- seo:end -->/, () => notFound.head)
    .replace('<div id="root"></div>', () => `<div id="root" data-route="/not-found">${notFound.html}</div>`);
  await writeFile(path.join(dist, "404.html"), errorDocument);

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.map((route) => `  <url><loc>${escapeHtml(`${SITE_ORIGIN}${route}`)}</loc></url>`).join("\n")}\n</urlset>\n`;
  await writeFile(path.join(dist, "sitemap.xml"), sitemap);
  await writeFile(path.join(dist, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_ORIGIN}/sitemap.xml\n`);
  console.log(`Prerendered ${routes.length} indexable pages, a 404 page, and sitemap.xml.`);
} finally {
  await rm(serverDist, { recursive: true, force: true });
}
