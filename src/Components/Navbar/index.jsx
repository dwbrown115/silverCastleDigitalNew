import React, { useState, useEffect } from "react";

import "./navbar.scss";
function Navbar() {
  const [backgroundColor, setBackgroundColor] = useState("transparent");
  const [logo, setLogo] = useState("./silverCastleDigitalLogo2.png");

  useEffect(() => {
    function handleScroll() {
      if (window.scrollY > 0) {
        setBackgroundColor("#503dfa");
      } else {
        setBackgroundColor("transparent");
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
    <div className="Navbar" style={{ backgroundColor }}>
      <div onClick={() => scrollTo("hero")} className="Logo">
        <img
          className="LogoImage"
          src={logo}
          alt="silverCastleDigitalLogo.png"
        />
      </div>
      <div className="NavbarElements">
        <div className="NavbarElementWrapper">
          <div onClick={() => scrollTo("about")} className="NavbarElement">
            <div className="SeparatorBefore" />
            <div className="Element">About</div>
            <div className="Separator" />
          </div>
          <div onClick={() => scrollTo("services")} className="NavbarElement">
            <div className="SeparatorBefore" />
            <div className="Element">Services</div>
            <div className="Separator" />
          </div>
          <div onClick={() => scrollTo("projects")} className="NavbarElement">
            <div className="SeparatorBefore" />
            <div className="Element">Projects</div>
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
