import { hero1 } from "../../Assets";
import "./hero.scss";

function Hero() {
  return (
    <section className="hero" id="hero" aria-labelledby="hero-heading">
      <img className="hero-background" src={hero1} alt="" width="1456" height="816" />
      <div className="hero-overlay" />
      <div className="container hero-content">
        <p className="eyebrow">Independent software practice</p>
        <h1 id="hero-heading">Useful ideas,<br />built into <em>real things.</em></h1>
        <p className="hero-summary">I use agentic systems to build software I want to use—tools for remembering, automating, playing, and making everyday work a little better.</p>
        <div className="hero-actions">
          <a className="button button-primary" href="#projects">See what I’m building <span aria-hidden="true">↘</span></a>
          <a className="button button-secondary" href="#contact">Start a conversation <span aria-hidden="true">↗</span></a>
        </div>
      </div>
      <div className="container hero-footnote">
        <span>Human direction</span><span>Agentic execution</span><span>Built through use</span>
      </div>
    </section>
  );
}

export default Hero;
