import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";

const AUTH_API = "http://localhost:6001/api/auth";

export default function Register() {
  const navigate = useNavigate();
  const [f, setF] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (f.password.length < 6) return setError("Password must be at least 6 characters.");
    if (f.password !== f.confirm) return setError("Passwords do not match.");

    setSending(true);
    try {
      const res = await fetch(`${AUTH_API}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: f.name.trim(),
          email: f.email.trim(),
          phone: f.phone.trim(),
          password: f.password,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Registration failed. Please try again.");

      // Account created: send them to login
      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <h1>Create your account</h1>
        <p className="auth-sub">Join Travelu and start booking tours.</p>

        <label>
          Full name
          <input required autoComplete="name" value={f.name} onChange={set("name")} />
        </label>

        <label>
          Email
          <input required type="email" autoComplete="email" value={f.email} onChange={set("email")} />
        </label>

        <label>
          Phone (optional)
          <input type="tel" autoComplete="tel" value={f.phone} onChange={set("phone")} />
        </label>

        <div className="auth-row">
          <label>
            Password
            <input required type="password" autoComplete="new-password" value={f.password} onChange={set("password")} />
          </label>
          <label>
            Confirm
            <input required type="password" autoComplete="new-password" value={f.confirm} onChange={set("confirm")} />
          </label>
        </div>

        {error && <p className="auth-error">{error}</p>}

        <button className="auth-btn" type="submit" disabled={sending}>
          {sending ? "Creating account..." : "Register"}
        </button>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </section>
  );
}