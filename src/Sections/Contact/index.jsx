import React from "react";

import { ContactForm } from "../../Components";

import "./contact.scss";

function Contact() {
  return (
    <div className="Contact" style={{ position: "relative" }}>
      <div
        id="contact"
        style={{ position: "absolute", top: -110, right: "50%" }}
      />
      {/* <h1>Contact</h1> */}
      <div className="Header">
        <h1>Contact</h1>
        <hr />
      </div>
      <div className="contactContent">
        <ContactForm />
        <div className="contactText">
          Whatever kind of website your company needs, we are here to make those
          dreams a reality.
        </div>
      </div>
    </div>
  );
}

export default Contact;
