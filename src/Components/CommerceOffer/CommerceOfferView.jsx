/* eslint-disable react/prop-types */
import { commercePrice } from "../../commerceCatalog";
import "../StripeOffer/stripeOffer.scss";

export default function CommerceOfferView({ config, state, dark = false, preview = false }) {
  const ready = state.status === "ready" && state.offer;
  const purchaseUrl = ready && !preview ? state.purchaseUrl : null;
  return (
    <div className={`stripe-offer${dark ? " stripe-offer-dark" : ""}`}>
      <p className="stripe-offer-preview">TEST MODE · Synthetic offer</p>
      <div aria-live="polite" aria-atomic="true">
        {ready && <><strong className="stripe-offer-name">{state.offer.name}</strong><p className="stripe-offer-description">{state.offer.description}</p><p className="stripe-offer-price">{commercePrice(state.offer)}</p></>}
        {state.status === "loading" && <p className="stripe-offer-note">Loading test offer…</p>}
        {state.status === "unconfigured" && <p className="stripe-offer-note">Test offer is not connected.</p>}
        {state.status === "error" && <p className="stripe-offer-note">Test offer details couldn’t be loaded.</p>}
        {state.status === "unavailable" && <p className="stripe-offer-note">This test offer is unavailable.</p>}
      </div>
      {purchaseUrl ? <a className="stripe-offer-link" href={purchaseUrl}>{config.label || "Open test purchase page"}<span aria-hidden="true">↗</span></a> : <span className="stripe-offer-disabled">Purchases disabled</span>}
    </div>
  );
}
