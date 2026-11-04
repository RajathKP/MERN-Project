import  React from "react";
import { Link, useNavigate } from "react-router-dom";
import Scene from "./components/Scene.jsx";

import { useState } from "react";
import "./styles.css";
/*
  Travelu login page.
  - Save as src/components/LoginPage.jsx
  - In App.jsx add: import LoginPage from "./components/LoginPage.jsx";
  - Colours read your existing CSS variables if you have them
    (--coral, --ink, --sand); otherwise the fallbacks below are used.
*/

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [form, setForm] = useState({ name: "", email: "", password: "", remember: true });
  const [errors, setErrors] = useState({});
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");

  const signup = mode === "signup";
  const set = (k) => (e) =>
    setForm({ ...form, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  const validate = () => {
    const e = {};
    if (signup && form.name.trim().length < 2) e.name = "Please enter your full name.";
    if (!EMAIL.test(form.email)) e.email = "Enter a valid email address.";
    if (form.password.length < 8) e.password = "Use at least 8 characters.";
    return e;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    setNote("");
    if (Object.keys(e).length) return;

    setBusy(true);
    try {
      // TODO: replace with your real API call, e.g.
      // const res = await fetch("/api/auth/login", { method: "POST", ... });
      await new Promise((r) => setTimeout(r, 700));
      navigate("/"); // or navigate("/admin") once that route exists
    } catch {
      setNote("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const switchMode = () => {
    setMode(signup ? "signin" : "signup");
    setErrors({});
    setNote("");
  };

  return (
    <div className="lg-page">
     

      <aside className="lg-art" aria-hidden="true">
        <Scene kind="savanna" />
        <div className="lg-art-cap">
          <span className="lg-eyebrow">TRAVELU</span>
          <h2>Your next story starts at sunrise.</h2>
          <p>Hand-picked tours, local guides and flexible dates in 60+ countries.</p>
        </div>
      </aside>

      <main className="lg-panel">
        <Link to="/" className="lg-back">← Back to home</Link>

        <form className="lg-card" onSubmit={submit} noValidate>
          <div className="lg-logo">Travelu<span>.</span></div>
          <h1>{signup ? "Create your account" : "Welcome back"}</h1>
          <p className="lg-sub">
            {signup
              ? "Save trips, track bookings and get member-only prices."
              : "Sign in to manage your bookings and saved trips."}
          </p>

          {signup && (
            <Field label="Full name" error={errors.name}>
              <input
                type="text"
                autoComplete="name"
                placeholder="Asha Kumar"
                value={form.name}
                onChange={set("name")}
                aria-invalid={!!errors.name}
              />
            </Field>
          )}
          <Field label="Email" error={errors.email}>
            <input
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={set("email")}
              aria-invalid={!!errors.email}
            />
          </Field>
          <Field label="Password" error={errors.password}>
            <div className="lg-pw">
              <input
                type={show ? "text" : "password"}
                autoComplete={signup ? "new-password" : "current-password"}
                placeholder="At least 8 characters"
                value={form.password}
                onChange={set("password")}
                aria-invalid={!!errors.password}
              />
              <button
                type="button"
                className="lg-eye"
                onClick={() => setShow(!show)}
                aria-label={show ? "Hide password" : "Show password"}
              >
                {show ? "Hide" : "Show"}
              </button>
            </div>
          </Field>

          {!signup && (
            <div className="lg-row">
              <label className="lg-check">
                <input type="checkbox" checked={form.remember} onChange={set("remember")} />
                Remember me
              </label>
              <a href="#forgot" onClick={(e) => { e.preventDefault(); setNote("Password reset isn't connected yet."); }}>
                Forgot password?
              </a>
            </div>
          )}

          {note && <div className="lg-note" role="alert">{note}</div>}

          <button className="btn coral lg-submit" type="submit" disabled={busy}>
            {busy ? "PLEASE WAIT…" : signup ? "CREATE ACCOUNT" : "SIGN IN"}
          </button>

          <div className="lg-or"><span>or</span></div>

          <button type="button" className="lg-social" onClick={() => setNote("Google sign-in isn't connected yet.")}>
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path fill="#4285F4" d="M22 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.6a4.8 4.8 0 0 1-2.1 3.1v2.6h3.4c2-1.8 3.1-4.5 3.1-7.5z" />
              <path fill="#34A853" d="M12 22c2.8 0 5.2-.9 6.9-2.5l-3.4-2.6c-.9.6-2.1 1-3.5 1-2.7 0-5-1.8-5.8-4.3H2.7v2.7A10 10 0 0 0 12 22z" />
              <path fill="#FBBC05" d="M6.2 13.6a6 6 0 0 1 0-3.8V7.1H2.7a10 10 0 0 0 0 9.2z" />
              <path fill="#EA4335" d="M12 6c1.5 0 2.9.5 4 1.5l3-3A10 10 0 0 0 2.7 7.1l3.5 2.7C7 7.800 9.300 6 12 6z" />
            </svg>
            Continue with Google
          </button>

          <p className="lg-switch">
            {signup ? "Already have an account?" : "New to Travelu?"}{" "}
            <button type="button" onClick={switchMode}>
              {signup ? "Sign in" : "Create an account"}
            </button>
          </p>
        </form>
      </main>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <label className="lg-field">
      <span>{label}</span>
      {children}
      {error && <em role="alert">{error}</em>}
    </label>
  );
}

