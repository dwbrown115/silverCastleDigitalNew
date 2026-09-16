import { useEffect, useRef, useState } from "react";
import "./navbar.scss";

function Navbar() {
  const [open, setOpen] = useState(false);
  const menuButton = useRef(null);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape" && open) {
        setOpen(false);
        menuButton.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header className="site-header">
      <div className="container header-inner">
        <a className="brand" href="#hero" onClick={close} aria-label="Silver Castle Digital home">
          <img src="/silverCastleDigitalLogoVector.svg" alt="" width="414" height="512" />
          <span>Silver Castle Digital</span>
        </a>
        <button ref={menuButton} className="menu-button" type="button" aria-expanded={open} aria-controls="site-navigation" onClick={() => setOpen(!open)}>
          {open ? "Close" : "Menu"}<span aria-hidden="true">{open ? "−" : "+"}</span>
        </button>
        <nav id="site-navigation" className={open ? "site-navigation is-open" : "site-navigation"} aria-label="Main navigation">
          <a href="#projects" onClick={close}>Projects</a>
          <a href="#approach" onClick={close}>Approach</a>
          <a className="nav-cta" href="#contact" onClick={close}>Start a conversation <span aria-hidden="true">↗</span></a>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
