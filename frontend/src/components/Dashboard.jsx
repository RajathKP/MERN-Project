import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";
import Scene from "./Scene.jsx";
import BookingModal from "./BookingModal.jsx";
import OverviewCard, { PastBookings } from "./Overviewcard.jsx";
import { Stars, ClockIcon, money } from "./common.jsx";
import "./Dashboard.css";

const API = "https://mern-project-htye.onrender.com/api/tours";
const AUTH_API = "https://mern-project-htye.onrender.com/api/auth";
const BOOKINGS_API = "https://mern-project-htye.onrender.com/api/bookings";
// ASSUMED endpoint for taxi bookings. Change it to match your taxi route.
const TAXI_API = "https://mern-project-htye.onrender.com/api/taxi-bookings";
const PAGE_SIZE = 9;

const GENDERS = ["Male", "Female", "Other", "Prefer not to say"];

const SORTS = [
  ["featured", "Featured"],
  ["price-asc", "Price: low to high"],
  ["price-desc", "Price: high to low"],
  ["rating", "Top rated"],
  ["days-asc", "Shortest trips"],
  ["days-desc", "Longest trips"],
];

const DURATIONS = [
  ["", "Any duration"],
  ["short", "1–4 days"],
  ["mid", "5–8 days"],
  ["long", "9+ days"],
];

// key, title, description
const NAV = [
  ["overview", "Overview", "Your trips, payments and saved tours at a glance"],
  ["profile", "Profile", "Your personal details and contact info"],
  ["bookings", "My bookings", "View and track your trips"],
  ["browse", "Browse tours", "Find and book your next trip"],
  ["saved", "Saved tours", "Tours you've bookmarked"],
];
const TAB_KEYS = NAV.map((n) => n[0]);

const ICONS = {
  overview: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
  profile: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.2 3.6-7 8-7s8 2.8 8 7" />
    </>
  ),
  bookings: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </>
  ),
  browse: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M15.5 8.5l-2 5-5 2 2-5z" />
    </>
  ),
  saved: <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />,
};

const Icon = ({ name }) => (
  <svg
    viewBox="0 0 24 24"
    width="22"
    height="22"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {ICONS[name]}
  </svg>
);

const Chevron = () => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M9 6l6 6-6 6" />
  </svg>
);

const fmtDate = (d) => {
  const date = new Date(d);
  return isNaN(date)
    ? d || "—"
    : date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
};

const readJSON = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const unique = (list) => [...new Set(list.filter(Boolean))].sort();

const Field = ({ label, value }) => (
  <div className="db-field">
    <span>{label}</span>
    <p className={value ? "" : "db-na"}>{value || "Not provided"}</p>
  </div>
);

const toForm = (u) => ({
  name: u?.name || "",
  bio: u?.bio || "",
  dob: u?.dob ? String(u.dob).slice(0, 10) : "",
  gender: u?.gender || "",
  phone: u?.phone || "",
  emergencyContact: u?.emergencyContact || "",
  address: u?.address || "",
});

export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get("tab");
  const tab = TAB_KEYS.includes(urlTab) ? urlTab : "overview";
  const goTab = (key) => setSearchParams({ tab: key });

  const [user, setUser] = useState(() => readJSON("user", null));
  const myEmail = (user?.email || "").trim().toLowerCase();

  // ------------------------------------------------ tours (browse / saved)
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [q, setQ] = useState("");
  const [region, setRegion] = useState("");
  const [type, setType] = useState("");
  const [duration, setDuration] = useState("");
  const [maxPrice, setMaxPrice] = useState(null); // null = no limit
  const [sort, setSort] = useState("featured");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const [saved, setSaved] = useState(() => readJSON("savedTours", []));
  const [booking, setBooking] = useState(null);

  const load = async (signal) => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(API, { signal });
      if (!res.ok) throw new Error(`Server error (${res.status})`);
      const data = await res.json();
      setTours(Array.isArray(data) ? data : Array.isArray(data.tours) ? data.tours : []);
    } catch (err) {
      if (err.name !== "AbortError") setError(err.message || "Unable to load tours.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const c = new AbortController();
    load(c.signal);
    window.scrollTo(0, 0);
    return () => c.abort();
  }, []);

  const toggleSaved = (id) => {
    setSaved((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try {
        localStorage.setItem("savedTours", JSON.stringify(next));
      } catch {
        /* storage unavailable */
      }
      return next;
    });
  };

  const savedOnly = tab === "saved";
  const regions = useMemo(() => unique(tours.map((t) => t.region)), [tours]);
  const types = useMemo(() => unique(tours.map((t) => t.type)), [tours]);
  const priceCeil = useMemo(
    () => Math.max(0, ...tours.map((t) => Number(t.price) || 0)),
    [tours]
  );
  const limit = maxPrice ?? priceCeil;

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const num = (v) => Number(v) || 0;

    const list = tours.filter((t) => {
      if (savedOnly && !saved.includes(t._id)) return false;
      if (region && t.region !== region) return false;
      if (type && t.type !== type) return false;
      if (maxPrice !== null && num(t.price) > maxPrice) return false;

      const d = num(t.days);
      if (duration === "short" && d > 4) return false;
      if (duration === "mid" && (d < 5 || d > 8)) return false;
      if (duration === "long" && d < 9) return false;

      if (needle) {
        const hay = [t.title, t.city, t.region, t.type, t.description]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });

    const sorters = {
      "price-asc": (a, b) => num(a.price) - num(b.price),
      "price-desc": (a, b) => num(b.price) - num(a.price),
      rating: (a, b) => num(b.rating) - num(a.rating),
      "days-asc": (a, b) => num(a.days) - num(b.days),
      "days-desc": (a, b) => num(b.days) - num(a.days),
    };
    return sorters[sort] ? [...list].sort(sorters[sort]) : list;
  }, [tours, q, region, type, duration, maxPrice, sort, savedOnly, saved]);

  useEffect(() => setVisible(PAGE_SIZE), [q, region, type, duration, maxPrice, sort, tab]);

  const hasFilters = q || region || type || duration || maxPrice !== null;
  const clearAll = () => {
    setQ("");
    setRegion("");
    setType("");
    setDuration("");
    setMaxPrice(null);
    setSort("featured");
  };

  // ------------------------------------------------ bookings
  const [bookings, setBookings] = useState([]);
  const [bLoading, setBLoading] = useState(false);
  const [bError, setBError] = useState("");

  const loadBookings = async (signal) => {
    if (!myEmail) return;
    try {
      setBLoading(true);
      setBError("");
      const token = localStorage.getItem("token");
      const res = await fetch(`${BOOKINGS_API}?email=${encodeURIComponent(myEmail)}`, {
        signal,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error(`Server error (${res.status})`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : Array.isArray(data.bookings) ? data.bookings : [];
      // safety net in case the server ignores the ?email filter
      const mine = list.filter((b) => (b.email || "").trim().toLowerCase() === myEmail);
      mine.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setBookings(mine);
    } catch (err) {
      if (err.name !== "AbortError") setBError(err.message || "Unable to load bookings.");
    } finally {
      setBLoading(false);
    }
  };

  // load bookings on sign-in and whenever the tab changes (the overview tab needs them too)
  useEffect(() => {
    if (!myEmail) return;
    const c = new AbortController();
    loadBookings(c.signal);
    return () => c.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, myEmail]);

  // taxi bookings for the overview; null means unavailable
  const [taxiBookings, setTaxiBookings] = useState(null);

  useEffect(() => {
    if (!myEmail) return;
    const c = new AbortController();
    (async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${TAXI_API}?email=${encodeURIComponent(myEmail)}`, {
          signal: c.signal,
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        const list = Array.isArray(data) ? data : Array.isArray(data.bookings) ? data.bookings : [];
        setTaxiBookings(list.filter((t) => (t.email || "").trim().toLowerCase() === myEmail));
      } catch (err) {
        if (err.name !== "AbortError") setTaxiBookings(null);
      }
    })();
    return () => c.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myEmail, tab]);

  // ------------------------------------------------ profile editing
  const [editing, setEditing] = useState(null); // "basic" | "contact" | "password" | null
  const [form, setForm] = useState(() => toForm(user));
  const [msg, setMsg] = useState(null); // { ok, text }
  const [saving, setSaving] = useState(false);
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });

  const authHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const startEdit = (section) => {
    setForm(toForm(user));
    setPw({ current: "", next: "", confirm: "" });
    setMsg(null);
    setEditing(section);
  };

  const cancelEdit = () => {
    setEditing(null);
    setMsg(null);
  };

  const setF = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const saveProfile = async (e, keys) => {
    e.preventDefault();
    setMsg(null);
    if (keys.includes("name") && !form.name.trim()) {
      return setMsg({ ok: false, text: "Name can't be empty." });
    }

    const payload = {};
    keys.forEach((k) => {
      payload[k] = (form[k] || "").trim();
    });

    setSaving(true);
    try {
      const res = await fetch(`${AUTH_API}/profile`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Could not update your details.");

      const next = { ...user, ...(data.user || {}), ...payload };
      try {
        localStorage.setItem("user", JSON.stringify(next));
      } catch {
        /* storage unavailable */
      }
      setUser(next);
      setEditing(null);
      setMsg({ ok: true, text: "Your details were updated." });
    } catch (err) {
      setMsg({ ok: false, text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setMsg(null);
    if (pw.next.length < 6) return setMsg({ ok: false, text: "New password must be at least 6 characters." });
    if (pw.next !== pw.confirm) return setMsg({ ok: false, text: "New passwords do not match." });

    setSaving(true);
    try {
      const res = await fetch(`${AUTH_API}/password`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ currentPassword: pw.current, newPassword: pw.next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Could not change your password.");
      setPw({ current: "", next: "", confirm: "" });
      setEditing(null);
      setMsg({ ok: true, text: "Your password was changed." });
    } catch (err) {
      setMsg({ ok: false, text: err.message });
    } finally {
      setSaving(false);
    }
  };

  // ------------------------------------------------ pieces of UI
  const initial = (user?.name || user?.email || "?").trim().charAt(0).toUpperCase();

  const loginPrompt = (text) => (
    <div className="db-state">
      <p>{text}</p>
      <Link to="/login" className="btn coral">
        LOGIN
      </Link>
    </div>
  );

  const saveRow = () => (
    <div className="db-actions-row full">
      <button className="btn coral" type="submit" disabled={saving}>
        {saving ? "SAVING..." : "SAVE"}
      </button>
      <button className="db-cancel" type="button" onClick={cancelEdit}>
        Cancel
      </button>
    </div>
  );

  // ------------------------------------------------ render
  return (
    <>
      <Header />
      <div className="db-topbar" />

      <div className="wrap db-shell">
        {/* ================= sidebar ================= */}
        <aside className="db-side">
          <div className="db-sum">
            {user ? (
              <>
                <div className="db-avatar">{initial}</div>
                <h3>{user.name || "Traveller"}</h3>
                {user.email && <p>{user.email}</p>}
                <button type="button" className="db-pill" onClick={() => goTab("saved")}>
                  Saved tours · {saved.length}
                </button>
              </>
            ) : (
              <>
                <div className="db-avatar">?</div>
                <h3>Welcome, guest</h3>
                <p>Log in to manage your profile and bookings.</p>
                <Link to="/login" className="btn coral db-sum-btn">
                  LOGIN
                </Link>
              </>
            )}
          </div>

          {user && !user.phone && (
            <div className="db-prompt">
              <h4>Add your mobile number</h4>
              <p>Get booking updates and let us reach you about your trips.</p>
              <button
                type="button"
                className="btn coral"
                onClick={() => {
                  goTab("profile");
                  startEdit("contact");
                }}
              >
                ADD
              </button>
            </div>
          )}

          <nav className="db-nav" aria-label="Account">
            {NAV.map(([key, title, desc]) => (
              <button
                key={key}
                type="button"
                className={tab === key ? "on" : ""}
                aria-current={tab === key ? "page" : undefined}
                onClick={() => goTab(key)}
              >
                <span className="db-nav-ic">
                  <Icon name={key} />
                </span>
                <span className="db-nav-t">
                  <b>{title}</b>
                  <small>{desc}</small>
                </span>
                <Chevron />
              </button>
            ))}
          </nav>

        </aside>

        {/* ================= main panel ================= */}
        <section className="db-panel">
          {/* ---------------- OVERVIEW ---------------- */}
          {tab === "overview" &&
            (!user ? (
              loginPrompt("Please log in to see your overview.")
            ) : (
              <>
                <h1>Overview</h1>
                <p className="db-sec-sub">A quick look at your trips and payments.</p>
                {bLoading ? (
                  <div className="db-state">
                    <p>Loading your overview...</p>
                  </div>
                ) : bError ? (
                  <div className="db-state">
                    <p>{bError}</p>
                    <button type="button" className="btn coral" onClick={() => loadBookings()}>
                      RETRY
                    </button>
                  </div>
                ) : (
                  <OverviewCard bookings={bookings} taxiBookings={taxiBookings} savedCount={saved.length} />
                )}
                <div className="db-ov-actions">
                  <button type="button" className="btn coral" onClick={() => goTab("browse")}>
                    BROWSE TOURS
                  </button>
                  <button type="button" className="db-ov-link" onClick={() => goTab("bookings")}>
                    View all bookings
                  </button>
                </div>

                {!bLoading && !bError && <PastBookings bookings={bookings} />}
              </>
            ))}

          {/* ---------------- PROFILE ---------------- */}
          {tab === "profile" &&
            (!user ? (
              loginPrompt("Please log in to manage your profile.")
            ) : (
              <>
                <h1>{user.name || "Your profile"}</h1>

                {/* basic information */}
                <div className="db-sec">
                  <div className="db-sec-head">
                    <h2>Basic information</h2>
                    {editing !== "basic" && (
                      <button type="button" className="db-edit" onClick={() => startEdit("basic")}>
                        Edit
                      </button>
                    )}
                  </div>
                  <p className="db-sec-sub">
                    Make sure this information matches your travel ID, like your passport or licence.
                  </p>

                  {editing === "basic" ? (
                    <form className="db-form" onSubmit={(e) => saveProfile(e, ["name", "bio", "dob", "gender"])}>
                      <label>
                        Full name
                        <input required autoComplete="name" value={form.name} onChange={setF("name")} />
                      </label>
                      <label>
                        Date of birth
                        <input
                          type="date"
                          max={new Date().toISOString().slice(0, 10)}
                          value={form.dob}
                          onChange={setF("dob")}
                        />
                      </label>
                      <label>
                        Gender
                        <select value={form.gender} onChange={setF("gender")}>
                          <option value="">Not provided</option>
                          {GENDERS.map((g) => (
                            <option key={g}>{g}</option>
                          ))}
                        </select>
                      </label>
                      <label className="full">
                        Bio
                        <textarea rows="3" maxLength="300" value={form.bio} onChange={setF("bio")} />
                      </label>
                      {msg && !msg.ok && <p className="db-msg err full">{msg.text}</p>}
                      {saveRow()}
                    </form>
                  ) : (
                    <>
                      <div className="db-fields">
                        <Field label="Name" value={user.name} />
                        <Field label="Bio" value={user.bio} />
                        <Field label="Date of birth" value={user.dob ? fmtDate(user.dob) : ""} />
                        <Field label="Gender" value={user.gender} />
                      </div>
                      {msg?.ok && <p className="db-msg ok">{msg.text}</p>}
                    </>
                  )}
                </div>

                {/* contact */}
                <div className="db-sec">
                  <div className="db-sec-head">
                    <h2>Contact</h2>
                    {editing !== "contact" && (
                      <button type="button" className="db-edit" onClick={() => startEdit("contact")}>
                        Edit
                      </button>
                    )}
                  </div>
                  <p className="db-sec-sub">
                    You can sign in, receive account activity alerts, and get trip updates by sharing this
                    information.
                  </p>

                  {editing === "contact" ? (
                    <form
                      className="db-form"
                      onSubmit={(e) => saveProfile(e, ["phone", "emergencyContact", "address"])}
                    >
                      <label>
                        Mobile number
                        <input type="tel" autoComplete="tel" value={form.phone} onChange={setF("phone")} />
                      </label>
                      <label>
                        Email
                        <input value={user.email || ""} disabled />
                        <small>Your email is your login and can't be changed here.</small>
                      </label>
                      <label>
                        Emergency contact
                        <input
                          placeholder="Name and phone number"
                          value={form.emergencyContact}
                          onChange={setF("emergencyContact")}
                        />
                      </label>
                      <label>
                        Address
                        <input autoComplete="street-address" value={form.address} onChange={setF("address")} />
                      </label>
                      {msg && !msg.ok && <p className="db-msg err full">{msg.text}</p>}
                      {saveRow()}
                    </form>
                  ) : (
                    <>
                      <div className="db-fields">
                        <Field label="Mobile number" value={user.phone} />
                        <Field label="Email" value={user.email} />
                        <Field label="Emergency contact" value={user.emergencyContact} />
                        <Field label="Address" value={user.address} />
                      </div>
                      {msg?.ok && <p className="db-msg ok">{msg.text}</p>}
                    </>
                  )}
                </div>

                {/* security */}
                <div className="db-sec">
                  <div className="db-sec-head">
                    <h2>Security</h2>
                    {editing !== "password" && (
                      <button type="button" className="db-edit" onClick={() => startEdit("password")}>
                        Edit
                      </button>
                    )}
                  </div>
                  <p className="db-sec-sub">Keep your account safe with a strong password.</p>

                  {editing === "password" ? (
                    <form className="db-form" onSubmit={changePassword}>
                      <label className="full">
                        Current password
                        <input
                          required
                          type="password"
                          autoComplete="current-password"
                          value={pw.current}
                          onChange={(e) => setPw({ ...pw, current: e.target.value })}
                        />
                      </label>
                      <label>
                        New password
                        <input
                          required
                          type="password"
                          autoComplete="new-password"
                          value={pw.next}
                          onChange={(e) => setPw({ ...pw, next: e.target.value })}
                        />
                      </label>
                      <label>
                        Confirm new password
                        <input
                          required
                          type="password"
                          autoComplete="new-password"
                          value={pw.confirm}
                          onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
                        />
                      </label>
                      {msg && !msg.ok && <p className="db-msg err full">{msg.text}</p>}
                      {saveRow()}
                    </form>
                  ) : (
                    <>
                      <div className="db-fields">
                        <Field label="Password" value="••••••••" />
                      </div>
                      {msg?.ok && <p className="db-msg ok">{msg.text}</p>}
                    </>
                  )}
                </div>
              </>
            ))}

          {/* ---------------- BOOKINGS ---------------- */}
          {tab === "bookings" && (
            <>
              <h1>My bookings</h1>
              <p className="db-sec-sub">Your tour requests and their status.</p>

              {!myEmail ? (
                loginPrompt("Please log in to see your bookings.")
              ) : bLoading ? (
                <div className="db-state">
                  <p>Loading your bookings...</p>
                </div>
              ) : bError ? (
                <div className="db-state">
                  <p>{bError}</p>
                  <button type="button" className="btn coral" onClick={() => loadBookings()}>
                    RETRY
                  </button>
                </div>
              ) : bookings.length === 0 ? (
                <div className="db-state">
                  <p>You haven't booked any tours yet.</p>
                  <button type="button" className="btn coral" onClick={() => goTab("browse")}>
                    BROWSE TOURS
                  </button>
                </div>
              ) : (
                <ul className="db-blist">
                  {bookings.map((b) => {
                    const status = (b.status || "pending").toLowerCase();
                    return (
                      <li className="db-bitem" key={b._id}>
                        <div className="db-bmain">
                          <h3>
                            {b.tourId ? (
                              <Link to={`/tours/${b.tourId}`}>{b.tourTitle || "Tour"}</Link>
                            ) : (
                              b.tourTitle || "Tour"
                            )}
                          </h3>
                          <p>
                            Travel date: <b>{fmtDate(b.travelDate)}</b> · {b.guests || 1} guest
                            {Number(b.guests) === 1 ? "" : "s"}
                          </p>
                          {b.createdAt && <small>Booked on {fmtDate(b.createdAt)}</small>}
                          {b.notes && <small className="db-bnotes">“{b.notes}”</small>}
                        </div>
                        <div className="db-bside">
                          <span className={`db-status ${status}`}>{status}</span>
                          <b>{money(b.totalPrice)}</b>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </>
          )}

          {/* ---------------- BROWSE / SAVED ---------------- */}
          {(tab === "browse" || tab === "saved") && (
            <>
              <h1>{savedOnly ? "Saved tours" : "Browse tours"}</h1>
              <p className="db-sec-sub">
                {loading
                  ? "Loading tours..."
                  : `${results.length} tour${results.length === 1 ? "" : "s"} ${
                      savedOnly ? "saved" : "found"
                    }`}
              </p>

              <input
                type="search"
                className="db-search"
                placeholder="Search by tour, city, region or type..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                aria-label="Search tours"
              />

              <div className="db-filterbar">
                <select value={region} onChange={(e) => setRegion(e.target.value)} aria-label="Region">
                  <option value="">All regions</option>
                  {regions.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>

                <select value={type} onChange={(e) => setType(e.target.value)} aria-label="Tour type">
                  <option value="">All types</option>
                  {types.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>

                <select value={duration} onChange={(e) => setDuration(e.target.value)} aria-label="Duration">
                  {DURATIONS.map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>

                <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort by">
                  {SORTS.map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>

                {priceCeil > 0 && (
                  <label className="db-range">
                    Max price: <b>{money(limit)}</b>
                    <input
                      type="range"
                      min="0"
                      max={priceCeil}
                      step={Math.max(1, Math.round(priceCeil / 100))}
                      value={limit}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        setMaxPrice(v >= priceCeil ? null : v);
                      }}
                    />
                  </label>
                )}

                {hasFilters && (
                  <button type="button" className="link-btn db-clear" onClick={clearAll}>
                    Clear all
                  </button>
                )}
              </div>

              {error && (
                <div className="db-state">
                  <p>{error}</p>
                  <button type="button" className="btn coral" onClick={() => load()}>
                    RETRY
                  </button>
                </div>
              )}

              {!loading && !error && results.length === 0 && (
                <div className="db-state">
                  <p>
                    {savedOnly && !hasFilters
                      ? "You haven't saved any tours yet. Tap the heart on a tour to save it."
                      : "No tours match your filters."}
                  </p>
                  {hasFilters ? (
                    <button type="button" className="btn coral" onClick={clearAll}>
                      CLEAR FILTERS
                    </button>
                  ) : (
                    savedOnly && (
                      <button type="button" className="btn coral" onClick={() => goTab("browse")}>
                        BROWSE TOURS
                      </button>
                    )
                  )}
                </div>
              )}

              <div className="db-grid">
                {loading && Array.from({ length: 6 }).map((_, i) => <div className="db-skel" key={i} />)}

                {!loading &&
                  results.slice(0, visible).map((t) => {
                    const isSaved = saved.includes(t._id);
                    const was = t.oldPrice || t.was;
                    return (
                      <article className="db-card" key={t._id}>
                        <Link to={`/tours/${t._id}`} className="db-img">
                          <Scene kind={t.scene} image={t.image} alt={t.title} />
                          {t.city && <span className="tag">{t.city}</span>}
                        </Link>

                        <button
                          type="button"
                          className={`db-heart ${isSaved ? "on" : ""}`}
                          onClick={() => toggleSaved(t._id)}
                          aria-pressed={isSaved}
                          aria-label={isSaved ? "Remove from saved" : "Save tour"}
                        >
                          {isSaved ? "♥" : "♡"}
                        </button>

                        <div className="db-body">
                          <div className="db-meta">
                            {t.type && <span className="db-chip">{t.type}</span>}
                            <span>
                              <ClockIcon /> {t.days} days
                            </span>
                          </div>

                          <h3>
                            <Link to={`/tours/${t._id}`}>{t.title}</Link>
                          </h3>
                          {t.region && <p className="db-region">{t.region}</p>}
                          <Stars n={Number(t.rating || 0)} />

                          <div className="db-foot">
                            <div className="db-price">
                              {Number(was) > Number(t.price) && <s>{money(was)}</s>}
                              <b>{money(t.price)}</b>
                              <small>per person</small>
                            </div>
                            <div className="db-actions">
                              <Link to={`/tours/${t._id}`} className="db-ghost">
                                Details
                              </Link>
                              <button
                                type="button"
                                className="btn coral db-book"
                                onClick={() => setBooking(t)}
                              >
                                BOOK
                              </button>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
              </div>

              {!loading && results.length > visible && (
                <div className="center db-more">
                  <button
                    type="button"
                    className="btn coral"
                    onClick={() => setVisible((v) => v + PAGE_SIZE)}
                  >
                    SHOW MORE ({results.length - visible} left)
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      <Footer />

      {booking && <BookingModal tour={booking} onClose={() => setBooking(null)} />}

    </>
  );
}