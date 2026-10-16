import { Link } from "react-router-dom";
import { ProjectCard } from "../../Sections/Projects";
import ProjectOffer from "../../Components/ProjectOffer";
import CommerceOfferView from "../../Components/CommerceOffer/CommerceOfferView";
import "../StripePreview/stripePreview.scss";

const commerce = { productId: "castleaf-desktop" };
const project = { slug: "commerce-fixture", name: "Castleaf synthetic fixture", category: "Local document tools", status: "Test only", intro: "Synthetic preview of a shared catalog offer on a portfolio card.", commerce };

export default function CommercePreview() {
  return (
    <main id="main" className="stripe-preview">
      <section className="projects"><div className="container">
        <h1>Shared catalog preview</h1>
        <p>Synthetic data only. No Stripe requests, checkout, or public project changes.</p>
        <Link className="text-link" to="/">Return to the portfolio</Link>
        <div className="current-projects stripe-preview-cards"><ProjectCard project={project} index={0} stripePreview showDetails={false} /></div>
      </div></section>
      <section className="project-detail-hero"><div className="container">
        <h2>Detail page offer</h2>
        <div className="detail-intro-wrap"><p className="detail-intro">The shared offer uses the same card and deeper-dive styling.</p><ProjectOffer content={project} projectName={project.name} dark preview /></div>
      </div></section>
      <section className="projects"><div className="container stripe-preview-states">
        {["loading", "error", "unavailable", "unconfigured"].map((status) => <article key={status}><h2>{status}</h2><CommerceOfferView config={commerce} state={{ status }} preview /></article>)}
      </div></section>
    </main>
  );
}
