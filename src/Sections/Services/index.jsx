import { portrait } from "../../Assets";
import "./services.scss";

const principles = [
  ["01", "Start with a real need", "A repetitive task, an awkward workflow, or a tool I keep wishing existed."],
  ["02", "Build with agents", "I direct agentic systems to explore, implement, test, and refine—with judgment steering the work."],
  ["03", "Use what I make", "Daily use exposes what matters. The product gets better because I’m also the person depending on it."],
];

function Services() {
  return (
    <section className="approach" id="approach" aria-labelledby="approach-heading">
      <div className="container approach-grid">
        <div className="approach-copy">
          <p className="eyebrow">02 / The approach</p>
          <h2 id="approach-heading">Small practice.<br /><em>Personal stake.</em></h2>
          <p className="approach-lead">I’m Dakota. Silver Castle Digital is where I build the things I want to exist.</p>
          <p>I work directly with agentic systems to move from an idea to functioning software, then keep improving it through real use. That makes the process unusually fast without losing the human decisions that make a product worth using.</p>
          <a className="text-link" href="#contact">Say hello <span aria-hidden="true">↗</span></a>
        </div>
        <figure className="portrait-frame">
          <img src={portrait} alt="Dakota Brown, founder of Silver Castle Digital" loading="lazy" />
          <figcaption><span>Dakota Brown</span><span>Builder & founder</span></figcaption>
        </figure>
      </div>
      <div className="container principle-list">
        {principles.map(([number, title, description]) => (
          <article key={number}><span>{number}</span><h3>{title}</h3><p>{description}</p></article>
        ))}
      </div>
    </section>
  );
}

export default Services;
