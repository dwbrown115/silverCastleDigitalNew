import React from "react";

import { portrait } from "../../Assets";
import "./about.scss";
function About() {
  return (
    <div className="About" style={{ position: "relative" }}>
      <div
        id="about"
        style={{ position: "absolute", top: -92.61, right: "50%" }}
      />
      <div className="aboutContent">
        <div className="aboutContentHeader">About us</div>
        <hr className="aboutContentSeperator" />
        <div className="aboutContentBody">
          <div className="aboutContentImage">
            <img src={portrait} alt="portrait" className="contentImage" />
          </div>
          <div className="aboutContentText">
            <div className="aboutContentBodyText">
              <p>
                It says us, but really it's just one person for now. Anyways, hello my
                name is Dakota Brown.
              </p>
            </div>
            <div className="aboutContentBodyText">
              <p>
                I am here to build you a kickass website and build up my
                portfolio, so that I can continue to build up my skills and face
                unique challenges I can't get with personal projects
              </p>
            </div>
            <div className="aboutContentBodyText">
              <p>
                To accomplish this and achieve my greater goals I want to build
                you a website you didn't even know you needed all for a great
                price.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;
