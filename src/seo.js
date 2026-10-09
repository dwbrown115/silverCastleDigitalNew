export const SITE_ORIGIN = "https://www.silvercastledigital.com";
export const SITE_NAME = "Silver Castle Digital";
export const HOME_DESCRIPTION = "Dakota Brown's independent software practice. Explore useful tools, AI research, and playable games built with agentic systems at Silver Castle Digital.";

const person = { "@type": "Person", "@id": `${SITE_ORIGIN}/#dakota-brown`, name: "Dakota Brown" };
const organization = {
  "@type": "Organization",
  "@id": `${SITE_ORIGIN}/#organization`,
  name: SITE_NAME,
  url: `${SITE_ORIGIN}/`,
  logo: `${SITE_ORIGIN}/silverCastleDigitalLogo2.png`,
  email: "dakota.w.brown@silvercastledigital.com",
  founder: { "@id": person["@id"] },
  sameAs: [
    "https://github.com/dwbrown115",
    "https://www.linkedin.com/company/silver-castle-digital/",
    "https://www.instagram.com/silvercastledigital/",
  ],
};
const website = {
  "@type": "WebSite",
  "@id": `${SITE_ORIGIN}/#website`,
  name: SITE_NAME,
  url: `${SITE_ORIGIN}/`,
  publisher: { "@id": organization["@id"] },
  inLanguage: "en",
};

export function normalizePath(pathname) {
  const path = pathname.split(/[?#]/)[0].replace(/\/index\.html$/, "/").replace(/\.html$/, "").replace(/\/+$/, "");
  return path || "/";
}

export function getIndexablePaths(projectIndex) {
  return ["/", ...Object.values(projectIndex).flatMap((project) => [
    `/${project.slug}`,
    ...(project.pages || []).map((page) => `/${project.slug}/${page.slug}`),
  ]), "/privacy/kitten-jump"];
}

export function getPageSeo(pathname, projectIndex) {
  const path = normalizePath(pathname);
  const [projectSlug, pageSlug, extra] = path.slice(1).split("/");
  const project = projectIndex[projectSlug];
  const page = pageSlug ? project?.pages?.find((entry) => entry.slug === pageSlug) : null;
  const isProject = Boolean(project && !extra && (!pageSlug || page));
  const isHome = path === "/";
  const isPrivacy = path === "/privacy/kitten-jump";
  const indexable = isHome || isProject || isPrivacy;
  const content = page ? { ...project, ...page } : project;
  const name = page ? page.title || page.name : project?.name;
  const title = isHome ? `${SITE_NAME} | Agentic Software & Game Development`
    : isPrivacy ? `KJR: Take To The Sky Privacy Policy | ${SITE_NAME}`
    : isProject ? `${name} | ${SITE_NAME}`
    : `Project not found | ${SITE_NAME}`;
  const description = isHome ? HOME_DESCRIPTION
    : isPrivacy ? "Privacy policy for the Android game KJR: Take To The Sky by SilverCastle Digital. Information about game data, purchases, advertising, and privacy choices."
    : isProject ? (page ? page.seoDescription || page.intro || page.summary || project.intro : project.seoDescription || project.intro)
    : "This project page could not be found. Return to the Silver Castle Digital portfolio to browse current projects.";
  const canonical = indexable ? `${SITE_ORIGIN}${path}` : null;
  const image = content?.image ? new URL(content.image, SITE_ORIGIN).href : `${SITE_ORIGIN}/silverCastleDigitalLogo2.png`;
  const imageAlt = content?.image ? content.imageAlt || name : "Silver Castle Digital castle logo";
  const graph = [person, organization, website];

  if (indexable) {
    const webPage = {
      "@type": isHome ? "CollectionPage" : "WebPage",
      "@id": `${canonical}#webpage`,
      url: canonical,
      name: title,
      description,
      isPartOf: { "@id": website["@id"] },
      inLanguage: "en",
    };
    if (isHome) {
      webPage.mainEntity = {
        "@type": "ItemList",
        itemListElement: Object.values(projectIndex).map((entry, index) => ({
          "@type": "ListItem", position: index + 1, name: entry.name, url: `${SITE_ORIGIN}/${entry.slug}`,
        })),
      };
    } else if (isProject) {
      const workId = `${SITE_ORIGIN}/${project.slug}#project`;
      graph.push({
        "@type": "CreativeWork", "@id": workId, name: project.name,
        description: project.intro, url: `${SITE_ORIGIN}/${project.slug}`,
        creator: { "@id": person["@id"] },
      });
      webPage.about = { "@id": workId };
      const crumbs = [
        { name: SITE_NAME, item: `${SITE_ORIGIN}/` },
        { name: project.name, item: `${SITE_ORIGIN}/${project.slug}` },
        ...(page ? [{ name, item: canonical }] : []),
      ];
      webPage.breadcrumb = { "@id": `${canonical}#breadcrumb` };
      graph.push({
        "@type": "BreadcrumbList", "@id": `${canonical}#breadcrumb`,
        itemListElement: crumbs.map((crumb, index) => ({ "@type": "ListItem", position: index + 1, ...crumb })),
      });
    }
    graph.push(webPage);
  }

  return {
    title, description, canonical, image, imageAlt,
    robots: indexable ? "index, follow, max-image-preview:large" : "noindex, follow",
    card: content?.image ? "summary_large_image" : "summary",
    structuredData: indexable ? { "@context": "https://schema.org", "@graph": graph } : null,
  };
}

export function getHeadElements(metadata) {
  const meta = (attributes) => ({ tag: "meta", attributes });
  return [
    { tag: "title", attributes: {}, text: metadata.title },
    meta({ name: "description", content: metadata.description }),
    meta({ name: "robots", content: metadata.robots }),
    meta({ name: "author", content: "Dakota Brown" }),
    ...(metadata.canonical ? [{ tag: "link", attributes: { rel: "canonical", href: metadata.canonical } }] : []),
    meta({ property: "og:type", content: "website" }),
    meta({ property: "og:site_name", content: SITE_NAME }),
    meta({ property: "og:locale", content: "en_US" }),
    meta({ property: "og:title", content: metadata.title }),
    meta({ property: "og:description", content: metadata.description }),
    ...(metadata.canonical ? [meta({ property: "og:url", content: metadata.canonical })] : []),
    meta({ property: "og:image", content: metadata.image }),
    meta({ property: "og:image:alt", content: metadata.imageAlt }),
    meta({ name: "twitter:card", content: metadata.card }),
    meta({ name: "twitter:title", content: metadata.title }),
    meta({ name: "twitter:description", content: metadata.description }),
    meta({ name: "twitter:image", content: metadata.image }),
    meta({ name: "twitter:image:alt", content: metadata.imageAlt }),
    ...(metadata.structuredData ? [{
      tag: "script", attributes: { type: "application/ld+json" },
      text: JSON.stringify(metadata.structuredData).replace(/</g, "\\u003c"),
    }] : []),
  ];
}

export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
}

export function renderSeoHead(metadata) {
  return getHeadElements(metadata).map(({ tag, attributes, text }) => {
    const attrs = Object.entries(attributes).map(([key, value]) => ` ${key}="${escapeHtml(value)}"`).join("");
    const start = `<${tag} data-seo${attrs}>`;
    return tag === "meta" || tag === "link" ? start : `${start}${tag === "script" ? text : escapeHtml(text)}</${tag}>`;
  }).join("\n    ");
}
