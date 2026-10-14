/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { catalogEndpoint, getStripeConfig, listingFromCatalog, loadStripeCatalog } from "../../stripeCatalog";
import StripeOfferView from "./StripeOfferView";

const endpoint = catalogEndpoint(import.meta.env.VITE_STRIPE_CATALOG_URL, import.meta.env.DEV);

function ConfiguredStripeOffer({ config, projectName, dark, preview }) {
  const [state, setState] = useState({ status: endpoint ? "loading" : "link-only", listing: null });
  useEffect(() => {
    if (!endpoint) return;
    let current = true;
    const refresh = () => {
      loadStripeCatalog(endpoint).then((catalog) => {
        if (!current) return;
        const listing = listingFromCatalog(catalog, config.paymentLink);
        setState({ status: listing ? "ready" : "error", listing });
      }).catch(() => {
        if (current) setState({ status: "error", listing: null });
      });
    };
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    refresh();
    const interval = window.setInterval(refreshWhenVisible, 30000);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      current = false;
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [config.paymentLink]);
  return <StripeOfferView config={config} state={state} projectName={projectName} dark={dark} preview={preview} />;
}

export default function StripeOffer({ stripe, projectName, dark = false, preview = false }) {
  const config = getStripeConfig(stripe);
  if (!config) return null;
  return <ConfiguredStripeOffer key={config.paymentLink} config={config} projectName={projectName} dark={dark} preview={preview} />;
}
