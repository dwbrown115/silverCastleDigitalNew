import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { getIndexablePaths, getPageSeo, normalizePath, renderSeoHead, SITE_ORIGIN } from "../src/seo.js";

const projectDirectory = new URL("../src/Data/projects/", import.meta.url);
const projects = readdirSync(projectDirectory).filter((file) => file.endsWith(".json")).map((file) => JSON.parse(readFileSync(new URL(file, projectDirectory), "utf8")));
const projectIndex = Object.fromEntries(projects.map((project) => [project.slug, project]));
const dist = new URL("../dist/", import.meta.url);

test("canonical URLs ignore tracking parameters, anchors, and static-file aliases", () => {
  for (const suffix of ["", "/", ".html", "/index.html", "?utm_source=test#projects"]) {
    assert.equal(getPageSeo(`/recall-harbor-info${suffix}`, projectIndex).canonical, `${SITE_ORIGIN}/recall-harbor-info`);
  }
  assert.equal(normalizePath("/index.html"), "/");
});

test("unknown projects and child pages cannot become indexable homepage duplicates", () => {
  for (const route of ["/missing", "/kernel-info/missing", "/kernel-info/research-history/extra"]) {
    const metadata = getPageSeo(route, projectIndex);
    assert.equal(metadata.robots, "noindex, follow");
    assert.equal(metadata.canonical, null);
    assert.equal(metadata.structuredData, null);
  }
});

test("a project snippet override does not replace a deeper dive's own description", () => {
  const metadata = getPageSeo("/kernel-info/research-history", projectIndex);
  assert.equal(metadata.description, projectIndex["kernel-info"].pages[0].intro);
  assert.notEqual(metadata.description, projectIndex["kernel-info"].seoDescription);
});

test("metadata escapes content without allowing a JSON-LD script to close early", () => {
  const project = { slug: "escape-info", name: 'A "quoted" & <tag> project', intro: "</script><script>alert(1)</script>", pages: [] };
  const head = renderSeoHead(getPageSeo("/escape-info", { "escape-info": project }));
  assert.ok(head.includes("&lt;tag&gt;"));
  assert.equal((head.match(/<script\b/g) || []).length, 1);
  const json = head.match(/<script[^>]*>(.*?)<\/script>/s)[1];
  assert.ok(!json.includes("<"));
  assert.equal(JSON.parse(json)["@graph"].find((entry) => entry["@type"] === "CreativeWork").description, project.intro);
});

test("every generated page contains content, a unique title, and its own canonical metadata", () => {
  const titles = new Set();
  for (const route of getIndexablePaths(projectIndex)) {
    const html = readFileSync(new URL(`${route.slice(1)}${route === "/" ? "" : "/"}index.html`, dist), "utf8");
    const title = html.match(/<title[^>]*>(.*?)<\/title>/s)[1];
    assert.ok(!titles.has(title), `Duplicate title for ${route}`);
    titles.add(title);
    assert.equal((html.match(/<h1\b/g) || []).length, 1, route);
    assert.equal((html.match(/rel="canonical"/g) || []).length, 1, route);
    assert.ok(html.includes(`href="${SITE_ORIGIN}${route}"`), route);
    assert.equal((html.match(/name="description"/g) || []).length, 1, route);
    assert.ok(html.includes('property="og:image"'), route);
    assert.ok(html.includes('name="twitter:card"'), route);
    JSON.parse(html.match(/<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/s)[1]);
    for (const image of html.matchAll(/<img[^>]+src="(\/[^"?#]+)"/g)) {
      assert.ok(existsSync(new URL(image[1].slice(1), dist)), `${route}: missing ${image[1]}`);
    }
    if (route !== "/") assert.ok(existsSync(new URL(`${route.slice(1)}.html`, dist)), route);
  }
});

test("the sitemap lists only real pages, robots advertises it, and 404 pages stay out of search", () => {
  const sitemap = readFileSync(new URL("sitemap.xml", dist), "utf8");
  const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
  assert.deepEqual(urls, getIndexablePaths(projectIndex).map((route) => `${SITE_ORIGIN}${route}`));
  assert.ok(readFileSync(new URL("robots.txt", dist), "utf8").includes(`Sitemap: ${SITE_ORIGIN}/sitemap.xml`));
  const error = readFileSync(new URL("404.html", dist), "utf8");
  assert.ok(error.includes('content="noindex, follow"'));
  assert.ok(!error.includes('rel="canonical"'));
});

test("SEO generation leaves the standalone privacy policy body unchanged", () => {
  const source = readFileSync(new URL("../public/privacy/kitten-jump/index.html", import.meta.url), "utf8");
  const generated = readFileSync(new URL("privacy/kitten-jump/index.html", dist), "utf8");
  assert.equal(generated.slice(generated.indexOf("<body>")), source.slice(source.indexOf("<body>")));
  assert.ok(!existsSync(path.join(new URL("../", import.meta.url).pathname, "dist-ssr")));
});
