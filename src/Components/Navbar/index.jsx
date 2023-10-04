import React, { useState, useEffect } from "react";

import "./navbar.scss";
function Navbar() {
  const [backgroundColor, setBackgroundColor] = useState("transparent");
  const [top, setTop] = useState("top");

  useEffect(() => {
    function handleScroll() {
      if (window.scrollY > 0) {
        setBackgroundColor("#634DD1");
        setTop("moved");
      } else {
        setBackgroundColor("transparent");
        setTop("top");
      }
    }

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  function scrollTo(name) {
    const element = document.getElementById(name);
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div
      className="Navbar"
      style={{
        backgroundColor,
        boxShadow:
          top === "top"
            ? "0 12px 20px 0 rgba(0, 0, 0, 0), 0 4px 10px 0 rgba(0, 0, 0, 0)"
            : "0 12px 20px 0 rgba(0, 0, 0, 0.2), 0 4px 10px 0 rgba(0, 0, 0, 0.2)",
      }}
    >
      <div onClick={() => scrollTo("hero")} className="Logo">
        <img
          className="LogoImage"
          src={"./silverCastleDigitalLogoVector.svg"}
          alt="silverCastleDigitalLogo.svg"
        />
      </div>
      <div className="NavbarElements">
        <div onClick={() => scrollTo("services")} className="NavbarElement">
          Services
        </div>
        <div onClick={() => scrollTo("projects")} className="NavbarElement">
          Projects
        </div>
        {/* <div onClick={() => scrollTo("team")} className="NavbarElement">
          Team
        </div> */}
        <div onClick={() => scrollTo("contact")} className="ContactButton">
          Get a Quote
        </div>
      </div>
    </div>
  );
}

export default Navbar;
