import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";

const AUTH_API = "http://localhost:6001/api/auth";

export default function Login() {
  const navigate = useNavigate();
  const [f, setF] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSending(true);

    try {
      const res = await fetch(`${AUTH_API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: f.email.trim(), password: f.password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Login failed. Please try again.");

      try {
        if (data.token) localStorage.setItem("token", data.token);
        if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
      } catch {
        /* storage unavailable */
      }
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <h1>Welcome back</h1>
        <p className="auth-sub">Login to manage your bookings.</p>

        <label>
          Email
          <input
            required
            type="email"
            autoComplete="email"
            value={f.email}
            onChange={set("email")}
          />
        </label>

        <label>
          Password
          <input
            required
            type="password"
            autoComplete="current-password"
            value={f.password}
            onChange={set("password")}
          />
        </label>

        {error && <p className="auth-error">{error}</p>}

        <button className="auth-btn" type="submit" disabled={sending}>
          {sending ? "Logging in..." : "Login"}
        </button>

        <p className="auth-switch">
          New here? <Link to="/register">Register</Link>
        </p>
      </form>
    </section>
  );
}