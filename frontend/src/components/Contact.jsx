import { useState } from "react";
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";
import "./Contact.css";

// ASSUMED endpoint for contact messages. Change it to match your backend route.
const CONTACT_API = "https://mern-project-htye.onrender.com/contact";

const EMPTY = { name: "", email: "", phone: "", subject: "", message: "" };

const CHANNELS = [
  {
    title: "Call us",
    value: "1-800-321-6543",
    href: "tel:18003216543",
    note: "Mon–Sat, 9am–7pm IST",
  },
  {
    title: "Email us",
    value: "hello@travelu.example",
    href: "mailto:hello@travelu.example",
    note: "We reply within one working day",
  },
  {
    title: "Visit us",
    value: "Travelu HQ, Bengaluru, Karnataka",
    note: "By appointment only",
  },
];

export default function Contact() {
  const [f, setF] = useState(EMPTY);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const set = (k) => (e) => setF((prev) => ({ ...prev, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (!f.name.trim()) return setError("Please enter your name.");
    if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) return setError("Please enter a valid email address.");
    if (f.message.trim().length < 10) return setError("Please write a message of at least 10 characters.");

    setSending(true);
    try {
      const res = await fetch(CONTACT_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: f.name.trim(),
          email: f.email.trim(),
          phone: f.phone.trim(),
          subject: f.subject.trim(),
          message: f.message.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Message could not be sent. Please try again.");
      setDone(true);
      setF(EMPTY);
    } catch (err) {
      setError(err.message || "Message could not be sent. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Header />
      <div className="ct-topbar" />

      <main className="ct-page">
        <section className="ct-hero">
          <span className="ct-eyebrow">Contact</span>
          <h1>We'd love to hear from you</h1>
          <p>
            Planning a trip, changing a booking or just curious about a tour? Send us a message and a travel
            expert will get back to you.
          </p>
        </section>

        <div className="wrap ct-layout">
          {/* ---------------- form ---------------- */}
          <section className="ct-card">
            <h2>Send a message</h2>

            {done ? (
              <div className="ct-success" role="status">
                <div className="ct-check" aria-hidden="true">✓</div>
                <h3>Thanks, we've got your message</h3>
                <p>We'll reply to your email within one working day.</p>
                <button type="button" className="ct-btn" onClick={() => setDone(false)}>
                  SEND ANOTHER MESSAGE
                </button>
              </div>
            ) : (
              <form className="ct-form" onSubmit={submit} noValidate>
                <div className="ct-row">
                  <label>
                    Full name *
                    <input autoComplete="name" value={f.name} onChange={set("name")} />
                  </label>
                  <label>
                    Email *
                    <input type="email" autoComplete="email" value={f.email} onChange={set("email")} />
                  </label>
                </div>

                <div className="ct-row">
                  <label>
                    Phone (optional)
                    <input type="tel" autoComplete="tel" value={f.phone} onChange={set("phone")} />
                  </label>
                  <label>
                    Subject
                    <select value={f.subject} onChange={set("subject")}>
                      <option value="">Choose a topic</option>
                      <option>Plan a trip</option>
                      <option>Existing booking</option>
                      <option>Payment question</option>
                      <option>Taxi booking</option>
                      <option>Something else</option>
                    </select>
                  </label>
                </div>

                <label>
                  Message *
                  <textarea rows="6" value={f.message} onChange={set("message")} />
                </label>

                {error && (
                  <p className="ct-error" role="alert">
                    {error}
                  </p>
                )}

                <button type="submit" className="ct-btn" disabled={sending}>
                  {sending ? "SENDING..." : "SEND MESSAGE"}
                </button>
              </form>
            )}
          </section>

          {/* ---------------- contact details ---------------- */}
          <aside className="ct-side">
            {CHANNELS.map((c) => (
              <div className="ct-channel" key={c.title}>
                <h3>{c.title}</h3>
                {c.href ? (
                  <a href={c.href} className="ct-value">
                    {c.value}
                  </a>
                ) : (
                  <p className="ct-value">{c.value}</p>
                )}
                <small>{c.note}</small>
              </div>
            ))}

            <div className="ct-channel">
              <h3>Office hours</h3>
              <p className="ct-value">Mon–Sat, 9am–7pm</p>
              <small>Closed on public holidays</small>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </>
  );
}