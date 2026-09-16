import { useRef, useState } from "react";
import emailjs from "@emailjs/browser";
import { EMAILJS_PUBLIC_KEY, EMAILJS_TEMPLATE_ID, EMAILJS_SERVICE_ID } from "../../../config";
import "./contactForm.scss";

function ContactForm() {
  const form = useRef();
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const data = new FormData(form.current);

    if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
      const subject = encodeURIComponent(`Silver Castle Digital inquiry from ${data.get("first_name")} ${data.get("last_name")}`);
      const body = encodeURIComponent(`${data.get("message")}\n\nCurrent website: ${data.get("website") || "Not provided"}\nReply to: ${data.get("email")}`);
      window.location.href = `mailto:dakota.w.brown@silvercastledigital.com?subject=${subject}&body=${body}`;
      setStatus("Opening your email app…");
      return;
    }

    setSending(true);
    setStatus("");
    try {
      await emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, form.current, EMAILJS_PUBLIC_KEY);
      form.current.reset();
      setStatus("Thanks—your message was sent.");
    } catch {
      setStatus("That didn’t send. Please email dakota.w.brown@silvercastledigital.com.");
    } finally {
      setSending(false);
    }
  }

  return (
    <form ref={form} onSubmit={handleSubmit} className="contact-form">
      <div className="form-grid">
        <label>First name<input required type="text" name="first_name" autoComplete="given-name" /></label>
        <label>Last name<input required type="text" name="last_name" autoComplete="family-name" /></label>
      </div>
      <label>Email<input required type="email" name="email" autoComplete="email" /></label>
      <label>Current website <span>(optional)</span><input type="url" name="website" placeholder="https://example.com" /></label>
      <label>What are you working on?<textarea required name="message" rows="5" placeholder="Tell me about the problem, idea, or tool you have in mind." /></label>
      <div className="form-bottom">
        <p className="form-status" role="status">{status}</p>
        <button type="submit" disabled={sending}>{sending ? "Sending…" : "Send inquiry"}<span aria-hidden="true">↗</span></button>
      </div>
    </form>
  );
}

export default ContactForm;
