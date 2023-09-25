import React from "react";

import "./hero.scss";
function Hero() {
  function scrollTo(name) {
    const element = document.getElementById(name);
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  return (
    <div className="Hero" style={{ position: "relative" }}>
      <div
        id="hero"
        style={{ position: "absolute", top: -110, right: "50%" }}
      />
      <div className="heroTop">
        <div className="heroTopHeader">Silver Castle Digital</div>
        <div className="heroTopSubHeader">
          Web development using the power of{" "}
          <span style={{ color: "#88CCFC" }}>Artificial Intelligence</span>.
          Quickly crafting stunning, professional, and functional websites for
          your business.
        </div>
        <div className="heroButtonWrapper">
          <button className="heroButton1" onClick={() => scrollTo("contact")}>
            Contact Us
          </button>
          <div className="heroButtonSpacer" />
          <button className="heroButton2" onClick={() => scrollTo("services")}>
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
}

export default Hero;
