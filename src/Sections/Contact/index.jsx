import { ContactForm } from "../../Components";
import "./contact.scss";

function Contact() {
  return (
    <section className="contact" id="contact" aria-labelledby="contact-heading">
      <div className="container">
        <p className="eyebrow">03 / Get in touch</p>
        <div className="contact-title-row">
          <h2 id="contact-heading">Have a problem worth<br /><em>building around?</em></h2>
          <a className="contact-email-button" href="mailto:dakota.w.brown@silvercastledigital.com" aria-label="Email Dakota Brown"><span aria-hidden="true">↗</span></a>
        </div>
        <div className="contact-grid">
          <div className="contact-copy">
            <p>Interesting workflows, useful tools, and ideas that keep asking to become real—I’d like to hear what you’re thinking about.</p>
            <a href="mailto:dakota.w.brown@silvercastledigital.com">dakota.w.brown@silvercastledigital.com</a>
          </div>
          <ContactForm />
        </div>
      </div>
    </section>
  );
}

export default Contact;
