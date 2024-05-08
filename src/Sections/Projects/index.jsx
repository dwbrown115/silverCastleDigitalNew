import React from "react";

import { Card } from "../../Components";
import {
  moolathonLogo,
  moolathonPreview,
  // infiniteWorldsWikiPreview,
} from "./Project Images";

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
      <div className="completedProjectsWrapper">
        <div className="completedProjects">Unstyled Completed Projects</div>
        {/* <img src={moolathonLogo} alt="Moolathon Logo" /> */}
        <div className="completedProjectsList">
          <Card
            Logo={"Infinite Worlds Wiki"}
            Preview={"/src/Sections/Projects/Project%20Images/InfiniteWorldsWiki/infiniteworldswikicapture.jpg"}
            Link={"https://master.d1kv85vnf49b6g.amplifyapp.com/"}
            Description={"A feature complete wiki for an author I enjoy"}
          />
        </div>
      </div>
    </div>
  );
}

export default Projects;
