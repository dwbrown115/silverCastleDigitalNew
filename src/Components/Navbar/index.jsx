import React, { useState, useEffect } from "react";

import "./navbar.scss";
function Navbar() {
  const [backgroundColor, setBackgroundColor] = useState("transparent");
  const [top, setTop] = useState("top");

  useEffect(() => {
    function handleScroll() {
      if (window.scrollY > 0) {
        setBackgroundColor("#503dfa");
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
        <div className="NavbarElementWrapper">
          <div onClick={() => scrollTo("services")} className="NavbarElement">
            <div className="SeparatorBefore" />
            <div className="Element">Services</div>
            <div className="Separator" />
          </div>
          <div onClick={() => scrollTo("method")} className="NavbarElement">
            <div className="SeparatorBefore" />
            <div className="Element">Methods</div>
            <div className="Separator" />
          </div>
          <div onClick={() => scrollTo("projects")} className="NavbarElement">
            <div className="SeparatorBefore" />
            <div className="Element">Projects</div>
            <div className="Separator" />
          </div>
          <div onClick={() => scrollTo("team")} className="NavbarElement">
            <div className="SeparatorBefore" />
            <div className="Element">Team</div>
            <div className="Separator" />
          </div>
          <div onClick={() => scrollTo("contact")} className="NavbarElement">
            <div className="SeparatorBefore" />
            <div className="Element">Contact</div>
            <div className="SeparatorContact" />
          </div>
        </div>
      </div>
      <div className="navbarShadow" />
    </div>
  );
}

export default Navbar;
