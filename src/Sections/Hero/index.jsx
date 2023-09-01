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
        style={{ position: "absolute", top: -92.61, right: "50%" }}
      />
      <div className="heroTop">
        <div className="heroTopHeader">Silver Castle Digital</div>
        <div className="heroTopSubHeader">
          Here to make your dreams a reality
        </div>
        {/* <div className="heroTopText">
          We're a web development company that specializes in creating
          beautiful, functional websites for small businesses and individuals.
        </div> */}
      </div>
      <div className="heroBottom">
        <div className="heroBottomText">
          We're a web development company that specializes in creating
          beautiful, functional websites for small businesses and individuals.
        </div>
        <div className="heroBottomButtonWrapper">
          <button
            onClick={() => scrollTo("about")}
            className="heroBottomButton"
          >
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
}

export default Hero;
