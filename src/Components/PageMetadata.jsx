import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { projectsBySlug } from "../Data/projects";
import { getHeadElements, getPageSeo } from "../seo";

function PageMetadata() {
  const { pathname } = useLocation();

  useEffect(() => {
    const metadata = getPageSeo(pathname, projectsBySlug);
    document.head.querySelectorAll("[data-seo]").forEach((element) => element.remove());
    for (const { tag, attributes, text } of getHeadElements(metadata)) {
      const element = document.createElement(tag);
      element.setAttribute("data-seo", "");
      for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, value);
      if (text) element.textContent = text;
      document.head.appendChild(element);
    }
  }, [pathname]);

  return null;
}

export default PageMetadata;
