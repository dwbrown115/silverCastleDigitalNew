import { Fragment, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { projectsBySlug } from "../../Data/projects";
import "./projectDetail.scss";

function UnknownProject() {
  return (
    <main className="project-not-found" id="main">
      <div className="container">
        <p className="eyebrow">Project not found</p>
        <h1>That page hasn’t been built yet.</h1>
        <p>The project may have moved, or the address may be incomplete.</p>
        <Link className="button button-primary" to="/#projects">Return to projects <span aria-hidden="true">↗</span></Link>
      </div>
    </main>
  );
}

function renderActionLink(action, className = "detail-try-link") {
  if (!action) return null;
  return (
    <a className={className} href={action.href} {...(action.external ? { target: "_blank", rel: "noreferrer" } : {})}>
      {action.label || "Try here"}<span aria-hidden="true">↗</span>
    </a>
  );
}

function renderRichBlurb(blurb) {
  if (typeof blurb === "string") return <p>{blurb}</p>;

  return (
    <div className="project-copy-entry">
      <p>{blurb.text}</p>
      {renderActionLink(blurb.tryHere)}
      {blurb.image && <figure><img src={blurb.image} alt={blurb.imageAlt || ""} loading="lazy" />{blurb.caption && <figcaption>{blurb.caption}</figcaption>}</figure>}
    </div>
  );
}

function ProjectDetail() {
  const { projectSlug, pageSlug } = useParams();
  const project = projectsBySlug[projectSlug];
  const page = pageSlug ? project?.pages?.find((item) => item.slug === pageSlug) : null;
  const content = page ? {
    ...project,
    ...page,
    name: page.name || page.title,
    pages: project.pages,
  } : project;
  const pageMissing = Boolean(pageSlug && !page);
  const documentTitle = content && !pageMissing ? `${content.name} | Silver Castle Digital` : "Project not found | Silver Castle Digital";

  useEffect(() => {
    document.title = documentTitle;
    return () => { document.title = "Silver Castle Digital"; };
  }, [documentTitle]);

  if (!project || pageMissing) return <UnknownProject />;

  return (
    <main className="project-detail" id="main">
      <section className="project-detail-hero">
        <div className="container">
          <Link className="project-back" to={page ? `/${project.slug}` : "/#projects"}><span aria-hidden="true">←</span> {page ? project.name : "All projects"}</Link>
          <div className="detail-title-row">
            <div>
              {content.category && <p className="eyebrow">{content.category}</p>}
              <h1>{content.name}</h1>
            </div>
            {content.status && <span className="detail-status">{content.status}</span>}
          </div>
          {(content.intro || content.tryHere) && <div className={`detail-intro-wrap${content.intro ? "" : " has-action-only"}`}>
            {content.intro && <p className="detail-intro">{content.intro}</p>}
            {renderActionLink(content.tryHere)}
          </div>}
        </div>
      </section>

      {(content.image || content.facts?.length > 0) && <section className={`project-detail-media${content.image ? "" : " has-no-image"}`}>
        <div className="container">
          {content.image && <div className="detail-art"><img src={content.image} alt={content.imageAlt || ""} /></div>}
          {content.facts?.length > 0 && <dl className="detail-facts">
            {content.facts.map((fact) => (
              <div key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>
            ))}
          </dl>}
        </div>
      </section>}

      <section className="project-story">
        <div className="container project-story-grid">
          <p className="eyebrow">The project</p>
          <div className="project-copy">
            {content.overview?.map((blurb, index) => <Fragment key={typeof blurb === "string" ? blurb : `${blurb.text}-${index}`}>{renderRichBlurb(blurb)}</Fragment>)}
          </div>
        </div>
        {(content.challenge || content.approach) && <div className="container project-decisions">
          {content.challenge && <article><span>01</span><h2>The challenge</h2><p>{content.challenge}</p></article>}
          {content.approach && <article><span>02</span><h2>The approach</h2><p>{content.approach}</p></article>}
        </div>}
      </section>

      {!page && project.pages?.length > 0 && <section className="project-pages">
        <div className="container">
          <div className="highlight-heading"><p className="eyebrow">Go deeper</p><h2>More from this project.</h2></div>
          <div className="project-page-grid">
            {project.pages.map((item, index) => (
              <Link to={`/${project.slug}/${item.slug}`} key={item.slug}>
                <span>0{index + 1}</span><h3>{item.title || item.name}</h3><p>{item.summary || item.intro}</p><strong>Read more <span aria-hidden="true">→</span></strong>
              </Link>
            ))}
          </div>
        </div>
      </section>}

      {content.highlights?.length > 0 && <section className="project-highlights">
        <div className="container">
          <div className="highlight-heading"><p className="eyebrow">What matters</p><h2>Built around the use case.</h2></div>
          <div className="highlight-grid">
            {content.highlights.map((highlight, index) => (
              <article key={highlight.title}><span>0{index + 1}</span><h3>{highlight.title}</h3><p>{highlight.text}</p></article>
            ))}
          </div>
        </div>
      </section>}

      {(content.next || content.primaryAction || page) && <section className="project-next">
        <div className="container project-next-grid">
          <p className="eyebrow">{page ? "Continue exploring" : "What’s next"}</p>
          <div>
            {content.next && <h2>{content.next}</h2>}
            {content.primaryAction && renderActionLink(content.primaryAction, "button button-primary")}
            {page && <Link className="project-overview-link" to={`/${project.slug}`}>Return to the {project.name} overview <span aria-hidden="true">→</span></Link>}
          </div>
        </div>
      </section>}
    </main>
  );
}

export default ProjectDetail;
