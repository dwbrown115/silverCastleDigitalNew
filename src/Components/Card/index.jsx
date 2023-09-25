import React from "react";

import "./card.scss";
function Card({ Logo, Preview, Link }) {
  return (
    <a className="Card" href={Link} target="_blank">
      {/* <img className="Logo" src={`${Logo}`} alt="Logo" />
      <img className="Preview" src={`${Preview}`} alt="Preview" /> */}
      <img className="Logo" src={Logo} alt="Logo" />
      <img className="Preview" src={Preview} alt="Preview" />
    </a>
  );
}

export default Card;
