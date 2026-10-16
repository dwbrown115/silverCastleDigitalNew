import { renderToStaticMarkup } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { Route, Routes } from "react-router-dom";
import CommerceOfferView from "../src/Components/CommerceOffer/CommerceOfferView";
import { ProjectCard } from "../src/Sections/Projects";
import ProjectDetail from "../src/Pages/ProjectDetail";
import { projectsBySlug } from "../src/Data/projects";

export function renderOffer(config, state, preview = false) {
  return renderToStaticMarkup(<CommerceOfferView config={config} state={state} preview={preview} />);
}

export function renderProjectFixture(provider) {
  const slug = "commerce-render-fixture";
  const project = { slug, name: "Fixture", category: "Test", ...provider, pages: [{ slug: "inherited", title: "Inherited" }, { slug: "hidden", title: "Hidden", commerce: null }] };
  projectsBySlug[slug] = project;
  try {
    return {
      card: renderToStaticMarkup(<StaticRouter location="/"><ProjectCard project={project} index={0} /></StaticRouter>),
      inherited: renderToStaticMarkup(<StaticRouter location={`/${slug}/inherited`}><Routes><Route path="/:projectSlug/:pageSlug" element={<ProjectDetail />} /></Routes></StaticRouter>),
      hidden: renderToStaticMarkup(<StaticRouter location={`/${slug}/hidden`}><Routes><Route path="/:projectSlug/:pageSlug" element={<ProjectDetail />} /></Routes></StaticRouter>),
    };
  } finally { delete projectsBySlug[slug]; }
}
