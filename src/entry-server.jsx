import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { AppContent } from "./App";
import { projectsBySlug } from "./Data/projects";
import { getIndexablePaths, getPageSeo, renderSeoHead } from "./seo";

export const routes = getIndexablePaths(projectsBySlug);

export function renderPage(path) {
  return {
    html: renderToString(<StaticRouter location={path}><AppContent /></StaticRouter>),
    head: renderSeoHead(getPageSeo(path, projectsBySlug)),
  };
}
