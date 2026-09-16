import {
  infiniteworldswikicapture,
  moolathonPreview,
} from "./Project Images";
import "./projects.scss";

const currentProjects = [
  {
    name: "Recall Harbor",
    type: "Knowledge & memory",
    status: "Web app available",
    description: "A private home for useful ideas, notes, and conversations—with imports, search, tags, and an optional ChatGPT connection.",
    image: "/projects/recall-harbor.png",
    imageAlt: "A quiet harbor protected by an illuminated stone breakwater",
    url: "https://recallharbor.app/",
    action: "Explore Recall Harbor",
  },
  {
    name: "KJR: Take To The Sky",
    type: "Games & play",
    status: "Nearing release",
    description: "A playful endless climber where a kitten bounces from rooftops to the stars, collecting mice and unlocking new feline companions.",
    image: "/projects/kjr.png",
    imageAlt: "An orange kitten leaping above rooftops toward a mouse on a red balloon",
    action: "Ask about KJR",
    subject: "KJR: Take To The Sky",
  },
  {
    name: "Automatic Task Helper",
    type: "Tools & automation",
    status: "In development",
    description: "A desktop app that turns repetitive browser work into reusable queues of clicks, text entry, navigation, waits, and conditional steps.",
    action: "Ask about Task Helper",
    subject: "Automatic Task Helper",
  },
];

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

function Projects() {
  return (
    <section className="projects" id="projects" aria-labelledby="projects-heading">
      <div className="container">
        <div className="section-heading project-heading">
          <p className="eyebrow">01 / Selected work</p>
          <div>
            <h2 id="projects-heading">Things I’m building.<br /><em>Things I actually use.</em></h2>
            <p>Three active projects aimed at memory, play, and the repetitive parts of working online.</p>
          </div>
        </div>

        <div className="current-projects">
          {currentProjects.map((project) => {
            const href = project.url || `mailto:dakota.w.brown@silvercastledigital.com?subject=${encodeURIComponent(project.subject)}`;
            return (
              <article className={`project-card project-card-${project.name.toLowerCase().replaceAll(/[^a-z]+/g, "-")}`} key={project.name}>
                <div className="project-art">
                  {project.image ? <img src={project.image} alt={project.imageAlt} loading="lazy" /> : <WorkflowVisual />}
                </div>
                <div className="project-meta"><span>{project.type}</span><span className="project-status">{project.status}</span></div>
                <h3>{project.name}</h3>
                <p>{project.description}</p>
                <a className="project-action" href={href} {...(project.url ? { target: "_blank", rel: "noreferrer" } : {})}>
                  {project.action}<span aria-hidden="true">↗</span>
                </a>
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
