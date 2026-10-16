/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { commerceEndpoint, commerceOfferState, getCommerceConfig, loadCommerceCatalog, purchasePage } from "../../commerceCatalog";
import CommerceOfferView from "./CommerceOfferView";

const endpoint = commerceEndpoint(import.meta.env.VITE_COMMERCE_CATALOG_URL, import.meta.env.DEV);
const approvedPage = purchasePage(import.meta.env.VITE_COMMERCE_PURCHASE_PAGE);
const purchasesEnabled = import.meta.env.VITE_COMMERCE_PURCHASES_ENABLED === "1";

function ConfiguredCommerceOffer({ config, dark, preview }) {
  const productId = config.productId;
  const [state, setState] = useState({ status: endpoint ? "loading" : "unconfigured", offer: null, purchaseUrl: null });
  useEffect(() => {
    if (!endpoint) return;
    let current = true;
    const refresh = () => loadCommerceCatalog(endpoint).then((catalog) => {
      if (current) setState(commerceOfferState(catalog, { productId }, approvedPage, purchasesEnabled));
    }).catch(() => {
      if (current) setState({ status: "error", offer: null, purchaseUrl: null });
    });
    const visibleRefresh = () => { if (document.visibilityState === "visible") refresh(); };
    refresh();
    const interval = window.setInterval(visibleRefresh, 30000);
    document.addEventListener("visibilitychange", visibleRefresh);
    return () => {
      current = false;
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", visibleRefresh);
    };
  }, [productId]);
  return <CommerceOfferView config={config} state={state} dark={dark} preview={preview} />;
}

export default function CommerceOffer({ commerce, dark = false, preview = false }) {
  const config = getCommerceConfig(commerce);
  return config ? <ConfiguredCommerceOffer key={config.productId} config={config} dark={dark} preview={preview} /> : null;
}
