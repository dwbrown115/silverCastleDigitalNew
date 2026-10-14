/* eslint-disable react/prop-types */
import { describeStripePrice } from "../../stripeCatalog";
import "./stripeOffer.scss";

export default function StripeOfferView({ config, state, projectName, dark = false, preview = false }) {
  const listing = state.listing;
  const name = listing?.name || projectName;
  const available = state.status === "ready" && listing?.status === "available";
  const inactive = state.status === "ready" && listing?.status === "inactive";
  const unavailable = state.status === "ready" && !available && !inactive;
  const price = available ? describeStripePrice(listing) : null;
  const action = available ? config.label || (listing.prices?.some((item) => item?.recurring) ? `Subscribe to ${name}` : `Buy ${name}`) : config.label || "View current pricing on Stripe";

  return (
    <div className={`stripe-offer${dark ? " stripe-offer-dark" : ""}`}>
      {preview && <p className="stripe-offer-preview">Synthetic preview: no payment available</p>}
      <div aria-live="polite" aria-atomic="true">
        {available && <><strong className="stripe-offer-name">{name}</strong>{listing.description && <p className="stripe-offer-description">{listing.description}</p>}<p className="stripe-offer-price">{price.label}</p>{price.notes.length > 0 && <p className="stripe-offer-note">{price.notes.join(" ")}</p>}</>}
        {state.status === "loading" && <p className="stripe-offer-note">Loading current listing…</p>}
        {state.status === "error" && <p className="stripe-offer-note">Current listing details couldn’t be loaded. Check pricing on Stripe.</p>}
        {state.status === "link-only" && <p className="stripe-offer-note">See current details and pricing on Stripe.</p>}
        {inactive && <p className="stripe-offer-note">This listing is no longer available.</p>}
        {unavailable && <p className="stripe-offer-note">Current listing details are unavailable. Check pricing on Stripe.</p>}
      </div>
      {!inactive && (preview ? <span className="stripe-offer-disabled">{action} (disabled in preview)</span> : <a className="stripe-offer-link" href={config.paymentLink} target="_blank" rel="noopener noreferrer">{action}<span className="sr-only"> (opens Stripe checkout in a new tab)</span><span aria-hidden="true">↗</span></a>)}
    </div>
  );
}
