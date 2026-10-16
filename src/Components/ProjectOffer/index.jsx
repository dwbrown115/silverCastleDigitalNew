/* eslint-disable react/prop-types */
import CommerceOffer from "../CommerceOffer";
import StripeOffer from "../StripeOffer";

export default function ProjectOffer({ content, projectName, dark = false, preview = false }) {
  if (Object.hasOwn(content, "commerce")) return <CommerceOffer commerce={content.commerce} dark={dark} preview={preview} />;
  return <StripeOffer stripe={content.stripe} projectName={projectName} dark={dark} preview={preview} />;
}
