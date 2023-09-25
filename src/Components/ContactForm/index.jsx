import React, { useState, useEffect } from "react";

import "./contactForm.scss";

function ContactForm() {
  const [isVisable, setIsVisable] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [message, setMessage] = useState("");
  const [reset, setReset] = useState(false);

  //   const resetClassNames = reset ? "resetButton" : "resetButton hidden";

  function handleSubmit(e) {
    e.preventDefault();
  }

  function handleResetConfirm() {
    setFirstName("");
    setLastName("");
    setEmail("");
    setWebsite("");
    setMessage("");
    setReset(false);
  }

  return (
    <form onSubmit={handleSubmit} className="contactForm">
      <div className="formRow">
        <div className="formLabel">First Name</div>
        <input
          onChange={(e) => setFirstName(e.target.value)}
          required
          value={firstName}
          type="text"
          className="inputField"
          id="firstName"
          placeholder="First Name:"
        />
      </div>
      <div className="formRow">
        <div className="formLabel">Last Name</div>
        <input
          onChange={(e) => setLastName(e.target.value)}
          required
          value={lastName}
          type="text"
          className="inputField"
          id="firstName"
          placeholder="Last Name:"
        />
      </div>
      <div className="formRow">
        <div className="formLabel">Email</div>
        <input
          onChange={(e) => setEmail(e.target.value)}
          required
          value={email}
          type="email"
          className="inputField"
          id="lastName"
          placeholder="Email:"
        />
      </div>
      <div className="formRow">
        <div className="formLabel">Current website</div>
        <input
          onChange={(e) => setWebsite(e.target.value)}
          required
          value={website}
          type="text"
          className="inputField"
          id="email"
          placeholder="example.com"
        />
      </div>
      <div className="formAreaRow">
        <div className="formLabel">What do you do?</div>
        <textarea
          onChange={(e) => setMessage(e.target.value)}
          required
          value={message}
          className="areaField"
          id="message"
          placeholder="Tell me what your company does, and what kind of website you need."
        />
      </div>
      <div className="formButtons">
        {reset === false ? (
          <div className="resetButtonWrapper">
            <button
              onClick={() => {
                setReset(true);
              }}
              type="button"
              className="resetButton"
            >
              Reset
            </button>
          </div>
        ) : (
          <div className="confirmButtonWrapper">
            <button
              className="resetButton"
              type="button"
              onClick={() => setReset(false)}
            >
              Cancel reset
            </button>
            <button
              className="resetButton"
              type="button"
              onClick={handleResetConfirm}
            >
              Confirm reset
            </button>
          </div>
        )}
        <button type="submit" className="formButton">
          Get a Quote
        </button>
      </div>
    </form>
  );
}

export default ContactForm;
