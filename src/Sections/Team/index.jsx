import React from "react";

import { Portrait } from "./TeamImages";

import "./team.scss";

function Team() {
  return (
    <div className="Team" style={{ position: "relative" }}>
      <div
        id="team"
        style={{ position: "absolute", top: -110, right: "50%" }}
      />
      {/* <div className="teamContent">
        <h1 className="teamContentHeader">Team</h1>
      </div> */}
      <div className="Header">
        <h1>Team</h1>
        <hr />
      </div>
      <div className="teamContent">
        <img className="teamImage" src={Portrait} alt="team" />
        <div className="teamContentText">
          <div className="teamHeader">Dakota Brown</div>
          <div className="teamSubHeader">Founder, Programmer and Designer</div>
          <div className="teamText">
            Hi. I'm currently the sole employee. I started this company to help
            me gain more practical experience building websites. Through
            personal projects and a few projects I have done for others, I can
            pretty much build whatever is needed. If you already have a design,
            or need one I can build it all. I am always looking for a new
            challenge so go ahead and contact us to build your next website
          </div>
        </div>
      </div>
    </div>
  );
}

export default Team;
