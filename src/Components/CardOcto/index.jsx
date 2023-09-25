import React from "react";

import "./cardOcto.scss";
function CardOcto({ Header, Text }) {
  return (
    <div className="card">
      {/* <h1>Card</h1> */}
      <div className="cardHeader">{Header}</div>
      <div className="cardText">{Text}</div>
    </div>
  );
}

export default CardOcto;
// Design Consultation
// Using the power of artificial intelligence we quickly and efficiently go
//         through possible designs with to meet your needs
