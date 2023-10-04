import React from "react";

import "./footer.scss";
function Footer() {
  function scrollTo(name) {
    const element = document.getElementById(name);
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="Footer">
      <div onClick={() => scrollTo("hero")} className="Logo">
        <img
          className="LogoImage"
          src={"./silverCastleDigitalLogoVector.svg"}
          alt="silverCastleDigitalLogo.svg"
        />
      </div>
      <div className="footerElements">
        <div className="elements">
          <div onClick={() => scrollTo("services")} className="element">
            Services
          </div>
          <div onClick={() => scrollTo("projects")} className="element">
            Projects
          </div>
          {/* <div onClick={() => scrollTo("team")} className="element">
            Team
          </div> */}
          <div onClick={() => scrollTo("contact")} className="ContactButton">
            Get a Quote
          </div>
        </div>
        <div className="socialMedia">
          <a
            href="https://www.instagram.com/silvercastledigital/"
            target="_blank"
          >
            <img src={"./instagram.svg"} alt="instagram.svg" />
          </a>
          <a
            href="https://www.facebook.com/silvercastledigital/"
            target="_blank"
          >
            <img src={"./facebook.svg"} alt="facebook.svg" />
          </a>
          <a href="https://twitter.com/SilverCastleDigital" target="_blank">
            <img src={"./twitter.svg"} alt="twitter.svg" />
          </a>
          <a
            href="https://www.linkedin.com/company/silver-castle-digital/"
            target="_blank"
          >
            <img src={"./linkedin.svg"} alt="linkedin.svg" />
          </a>
          <a href="https://github.com/dwbrown115" target="_blank">
            <img src={"./github.svg"} alt="github.svg" />
          </a>
        </div>
        <div className="bottom">
          Designed and maintained by Silver Castle Digital
        </div>
        <div className="copyright">© 2023 Silver Castle Digital</div>
      </div>
    </div>
  );
}

export default Footer;
