import React from "react";

import "./navbar.scss";
function Navbar() {
  return (
    <div className="Navbar">
      <div className="NavbarElements">
        <div className="Logo">
          <img
            className="LogoImage"
            src="./silverCastleDigitalLogo2.png"
            alt="silverCastleDigitalLogo.png"
          />
        </div>
        <div className="NavbarElementWrapper">
          {/* <div className="NavbarElement">
            <div className="SeparatorBefore" />
            <div className="Element">Home</div>
            <div className="Separator" />
          </div> */}
          <div className="NavbarElement">
            <div className="SeparatorBefore" />
            <div className="Element">About</div>
            <div className="Separator" />
          </div>
          <div className="NavbarElement">
            <div className="SeparatorBefore" />
            <div className="Element">Services</div>
            <div className="Separator" />
          </div>
          <div className="NavbarElement">
            <div className="SeparatorBefore" />
            <div className="Element">Projects</div>
            <div className="Separator" />
          </div>
          <div className="NavbarElement">
            <div className="SeparatorBefore" />
            <div className="Element">Contact</div>
            <div className="Separator" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
