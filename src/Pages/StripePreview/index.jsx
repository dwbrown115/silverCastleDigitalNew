import { Link } from "react-router-dom";
import StripeOffer from "../../Components/StripeOffer";
import StripeOfferView from "../../Components/StripeOffer/StripeOfferView";
import { ProjectCard } from "../../Sections/Projects";
import { projectsBySlug } from "../../Data/projects";
import "./stripePreview.scss";

const config = { paymentLink: "https://buy.stripe.com/test_silverCastleDemo", label: "View synthetic checkout" };
const base = {
  paymentLink: config.paymentLink, status: "available", name: "Synthetic test listing",
  description: "Fixture data for testing the optional Stripe integration.",
  prices: [{ name: "Synthetic test listing", unitAmount: 1900, unitAmountDecimal: "1900", currency: "usd", amountExponent: 2, quantity: 1, adjustableQuantity: null, billingScheme: "per_unit", taxBehavior: "exclusive", recurring: null }],
  automaticTax: false, shipping: false, trialDays: null,
};
const scenarios = [
  ["Recurring subscription", { status: "ready", listing: { ...base, prices: [{ ...base.prices[0], recurring: { interval: "month", intervalCount: 1, usageType: "licensed" } }] } }],
  ["Customer chooses amount", { status: "ready", listing: { ...base, prices: [{ ...base.prices[0], customAmount: true, unitAmount: null }] } }],
  ["Multiple items", { status: "ready", listing: { ...base, prices: [...base.prices, ...base.prices] } }],
  ["Loading", { status: "loading", listing: null }],
  ["Network failure", { status: "error", listing: null }],
  ["Inactive listing", { status: "ready", listing: { ...base, status: "inactive" } }],
];

export default function StripePreview() {
  const project = { ...projectsBySlug["recall-harbor-info"], stripe: config };
  return (
    <main id="main" className="stripe-preview">
      <section className="projects">
        <div className="container">
          <h1>Stripe integration preview</h1>
          <p>Local synthetic fixtures. No real listing, purchase, or portfolio content is changed.</p>
          <p>The card and detail examples load the local catalog endpoint. The remaining examples exercise display states.</p>
          <Link className="text-link" to="/">Return to the portfolio</Link>
          <div className="current-projects stripe-preview-cards"><ProjectCard project={project} index={0} stripePreview /></div>
        </div>
      </section>
      <section className="project-detail-hero">
        <div className="container">
          <h2>Detail page listing</h2>
          <div className="detail-intro-wrap"><p className="detail-intro">The same optional listing can appear within a project overview or deeper dive.</p><StripeOffer stripe={config} projectName={project.name} dark preview /></div>
        </div>
      </section>
      <section className="projects">
        <div className="container stripe-preview-states">
          {scenarios.map(([title, state]) => <article key={title}><h2>{title}</h2><StripeOfferView config={config} state={state} projectName="Synthetic test listing" preview /></article>)}
        </div>
      </section>
    </main>
  );
}
