import React from "react";

import { Card } from "../../Components";
import { moolathonLogo, moolathonPreview } from "./Project Images";

import "./projects.scss";

function Projects() {
  return (
    <div className="Projects" style={{ position: "relative" }}>
      <div
        id="projects"
        style={{ position: "absolute", top: -110, right: "50%" }}
      />
      {/* <h1>Projects</h1> */}
      <div className="Header">
        <h1>Projects</h1>
        <hr />
      </div>
      <div className="completedProjectsWrapper">
        <div className="completedProjects">Completed Projects</div>
        {/* <img src={moolathonLogo} alt="Moolathon Logo" /> */}
        <div className="completedProjectsList">
          <Card
            Logo={moolathonLogo}
            Preview={moolathonPreview}
            Link={"https://moolathon.com/"}
          />
        </div>
      </div>
    </div>
  );
}

export default Projects;
