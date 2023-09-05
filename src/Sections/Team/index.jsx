import React from "react";

import "./team.scss";
function Team() {
  return (
    <div className="Team" style={{ position: "relative" }}>
      <div
        id="team"
        style={{ position: "absolute", top: -92.61, right: "50%" }}
      />
      <div className="teamContent">
        <h1 className="teamContentHeader">Team</h1>
      </div>
    </div>
  );
}

export default Team;
