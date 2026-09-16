import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { projectsBySlug } from "../../Data/projects";
import "./projectDetail.scss";

function WorkflowArtwork() {
  return (
    <div className="detail-workflow" role="img" aria-label="A browser workflow moving through open, act, check, and repeat steps">
      <span>Browser workflow</span>
      <div>
        {["Open", "Act", "Check", "Repeat"].map((step, index) => (
          <p key={step}><small>0{index + 1}</small><strong>{step}</strong></p>
        ))}
      </div>
      <em>Reusable by design</em>
    </div>
  );
}

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

function ProjectDetail() {
  const { projectSlug } = useParams();
  const project = projectsBySlug[projectSlug];

  useEffect(() => {
    document.title = project ? `${project.name} | Silver Castle Digital` : "Project not found | Silver Castle Digital";
    return () => { document.title = "Silver Castle Digital"; };
  }, [project]);

  if (!project) return <UnknownProject />;

  return (
    <main className="project-detail" id="main">
      <section className="project-detail-hero">
        <div className="container">
          <Link className="project-back" to="/#projects"><span aria-hidden="true">←</span> All projects</Link>
          <div className="detail-title-row">
            <div>
              <p className="eyebrow">{project.category}</p>
              <h1>{project.name}</h1>
            </div>
            <span className="detail-status">{project.status}</span>
          </div>
          <p className="detail-intro">{project.intro}</p>
        </div>
      </section>

      <section className="project-detail-media">
        <div className="container">
          <div className="detail-art">
            {project.image ? <img src={project.image} alt={project.imageAlt} /> : <WorkflowArtwork />}
          </div>
          <dl className="detail-facts">
            {project.facts.map((fact) => (
              <div key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>
            ))}
          </dl>
        </div>
      </section>

      <section className="project-story">
        <div className="container project-story-grid">
          <p className="eyebrow">The project</p>
          <div className="project-copy">
            {project.overview.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
        </div>
        <div className="container project-decisions">
          <article><span>01</span><h2>The challenge</h2><p>{project.challenge}</p></article>
          <article><span>02</span><h2>The approach</h2><p>{project.approach}</p></article>
        </div>
      </section>

      <section className="project-highlights">
        <div className="container">
          <div className="highlight-heading"><p className="eyebrow">What matters</p><h2>Built around the use case.</h2></div>
          <div className="highlight-grid">
            {project.highlights.map((highlight, index) => (
              <article key={highlight.title}><span>0{index + 1}</span><h3>{highlight.title}</h3><p>{highlight.text}</p></article>
            ))}
          </div>
        </div>
      </section>

      <section className="project-next">
        <div className="container project-next-grid">
          <p className="eyebrow">What’s next</p>
          <div><h2>{project.next}</h2><a className="button button-primary" href={project.primaryAction.href} {...(project.primaryAction.external ? { target: "_blank", rel: "noreferrer" } : {})}>{project.primaryAction.label}<span aria-hidden="true">↗</span></a></div>
        </div>
      </section>
    </main>
  );
}

export default ProjectDetail;
