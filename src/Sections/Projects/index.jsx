import {
  infiniteworldswikicapture,
  moolathonPreview,
} from "./Project Images";
import { Link } from "react-router-dom";
import { projectsBySlug } from "../../Data/projects";
import "./projects.scss";

const projectOrder = [
  "recall-harbor-info",
  "kernel-info",
  "kjr-info",
  "automatic-task-helper-info",
  "game-server-info",
  "garvivor-info",
];

const currentProjects = projectOrder.map((slug) => projectsBySlug[slug]).filter(Boolean);

const earlierProjects = [
  {
    name: "Moolathon",
    description: "A polished web experience delivered for a client project.",
    image: moolathonPreview,
    url: "https://moolathon.com/",
  },
  {
    name: "Infinite Worlds Wiki",
    description: "A feature-complete fan wiki built for an author and their worlds.",
    image: infiniteworldswikicapture,
    url: "https://master.d1kv85vnf49b6g.amplifyapp.com/",
  },
];

function WorkflowVisual() {
  return (
    <div className="workflow-visual" aria-label="Reusable browser workflow: open, act, check, repeat" role="img">
      <span className="workflow-label">Reusable browser workflow</span>
      <div className="workflow-track">
        {[
          ["01", "Open"],
          ["02", "Act"],
          ["03", "Check"],
          ["04", "Repeat"],
        ].map(([number, label]) => (
          <div className="workflow-node" key={number}><span>{number}</span><strong>{label}</strong></div>
        ))}
      </div>
      <span className="workflow-note">Set it up once. Use it again.</span>
    </div>
  );
}

function renderProjectPlaceholder(project, index) {
  return (
    <div className="project-placeholder" aria-label={`${project.name}: ${project.category}`} role="img">
      <span className="project-placeholder-number">Project {String(index + 1).padStart(2, "0")}</span>
      <strong>{project.name}</strong>
      <div className="project-placeholder-footer">
        <span>{project.category}</span>
        <small>{project.status}</small>
      </div>
    </div>
  );
}

function Projects() {
  return (
    <section className="projects" id="projects" aria-labelledby="projects-heading">
      <div className="container">
        <div className="section-heading project-heading">
          <p className="eyebrow">01 / Selected work</p>
          <div>
            <h2 id="projects-heading">Things I’m building.<br /><em>Things I actually use.</em></h2>
            <p>Six active projects spanning knowledge continuity, adaptive cognition, games, automation, and secure backend systems.</p>
          </div>
        </div>

        <div className="current-projects">
          {currentProjects.map((project, index) => {
            const tryHere = project.tryHere;
            return (
              <article className={`project-card project-card-${project.name.toLowerCase().replaceAll(/[^a-z]+/g, "-")}`} key={project.name}>
                <div className="project-art">
                  {project.image ? <img src={project.image} alt={project.imageAlt || ""} loading="lazy" /> : project.slug === "automatic-task-helper-info" ? <WorkflowVisual /> : renderProjectPlaceholder(project, index)}
                </div>
                <div className="project-meta"><span>{project.category}</span><span className="project-status">{project.status}</span></div>
                <h3>{project.name}</h3>
                <p>{project.intro}</p>
                {tryHere && (
                  <a className="project-try-link" href={tryHere.href} {...(tryHere.external ? { target: "_blank", rel: "noreferrer" } : {})}>
                    {tryHere.label || "Try here"}<span aria-hidden="true">↗</span>
                  </a>
                )}
                <Link className="project-action" to={`/${project.slug}`}>
                  View project<span aria-hidden="true">↗</span>
                </Link>
              </article>
            );
          })}
        </div>

        <div className="earlier-work">
          <div className="earlier-heading"><p className="eyebrow">Earlier work</p><p>Previous builds that helped shape the practice.</p></div>
          <div className="earlier-list">
            {earlierProjects.map((project) => (
              <a className="earlier-card" href={project.url} target="_blank" rel="noreferrer" key={project.name}>
                <img src={project.image} alt="" loading="lazy" />
                <span><strong>{project.name}</strong><small>{project.description}</small></span>
                <span aria-hidden="true">↗</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Projects;
