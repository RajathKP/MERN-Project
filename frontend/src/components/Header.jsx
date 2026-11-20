import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import ProfileMenu from "./profilemenu.jsx";
import NotificationBell from "./NotificationBell.jsx";

// ----------------------------------------------------
// LOGO
// ----------------------------------------------------

export const Logo = () => (
  <Link className="logo" to="/" aria-label="Travelu home">
    <svg width="26" height="30" viewBox="0 0 26 30" aria-hidden="true">
      <rect x="9" y="1" width="8" height="5" rx="1.5" fill="none" stroke="#ffd400" strokeWidth="2" />
      <rect x="2" y="6" width="22" height="20" rx="4" fill="#ff7a59" />
      <rect x="6" y="9" width="14" height="14" rx="2" fill="#ffd400" opacity=".95" />
      <circle cx="8" cy="28.5" r="1.5" fill="#fff" />
      <circle cx="18" cy="28.5" r="1.5" fill="#fff" />
    </svg>

    <span>Travelu</span>
  </Link>
);

// ----------------------------------------------------
// NAVIGATION
// ----------------------------------------------------

const LINKS = [
  ["Home", "/"],
  ["Destinations", "/destinations"],
  ["Listings", "/#tours"],
  ["Taxi Booking", "/taxi"],
  ["Popular", "/#popular"],
  ["Contact", "/contact"]
];

// ----------------------------------------------------
// SOCIAL
// ----------------------------------------------------

const Social = ({ d }) => (
  <a href="#top" className="soc" aria-label="social">
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={d} />
    </svg>
  </a>
);

// ----------------------------------------------------
// AUTH + BOOKINGS FOR THE BELL
// TODO: these three lines are assumptions. Match them to how your app stores login.
//   - USER_KEY / TOKEN_KEY: the localStorage keys your login code writes
//   - BOOKINGS_URL: the endpoint that returns the signed-in user's tour bookings
// ----------------------------------------------------

const USER_KEY = "user";
const TOKEN_KEY = "token";
const API = "http://localhost:6001"; // backend port; must match API_BASE in AdminDashboard.jsx
const BOOKINGS_URL = `${API}/api/bookings/my`; // not used yet: bookings have no per-user endpoint

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
};

function useLoggedInUser() {
  const [user, setUser] = useState(readUser);
  const { pathname } = useLocation();

  // Re-check on every page change, so the bell shows right after login
  // and disappears right after logout without any extra code.
  useEffect(() => {
    setUser((prev) => {
      const next = readUser();
      return JSON.stringify(prev) === JSON.stringify(next) ? prev : next;
    });
  }, [pathname]);

  useEffect(() => {
    // Re-check when another tab logs in/out, and when your login code dispatches
    // window.dispatchEvent(new Event("auth-changed")) after login/logout.
    const sync = () => setUser(readUser());
    window.addEventListener("storage", sync);
    window.addEventListener("auth-changed", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("auth-changed", sync);
    };
  }, []);

  return user;
}

function useBookings(user) {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    if (!user) {
      setBookings([]);
      return;
    }
    let cancelled = false;
    const token = localStorage.getItem(TOKEN_KEY);

    fetch(BOOKINGS_URL, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => !cancelled && setBookings(Array.isArray(data) ? data : data.bookings || []))
      .catch(() => !cancelled && setBookings([]));

    return () => {
      cancelled = true;
    };
  }, [user]);

  return bookings;
}

// Server notifications (e.g. admin changed a booking status). Refreshes every 30s.
const NOTIFICATIONS_URL = `${API}/api/notifications`;

function useServerNotifications(user) {
  const [items, setItems] = useState([]);
  const [tick, setTick] = useState(0); // bump to force an immediate refresh

  useEffect(() => {
    if (!user) {
      setItems([]);
      return;
    }
    let cancelled = false;
    const load = () =>
      fetch(`${NOTIFICATIONS_URL}?email=${encodeURIComponent(user.email || "")}`)
        .then((r) => (r.ok ? r.json() : []))
        .then((data) =>
          !cancelled &&
          setItems(
            (Array.isArray(data) ? data : []).map((n) => ({
              id: n._id,
              title: n.title,
              message: n.message,
              tone: n.tone,
              read: n.read,
              date: n.createdAt,
            }))
          )
        )
        .catch(() => {});

    load();
    const timer = setInterval(load, 15000);
    const onFocus = () => document.visibilityState === "visible" && load();
    document.addEventListener("visibilitychange", onFocus);
    window.addEventListener("focus", onFocus);
    return () => {
      cancelled = true;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onFocus);
      window.removeEventListener("focus", onFocus);
    };
  }, [user, tick]);

  const markRead = (ids) => {
    if (!user) return;
    fetch(`${NOTIFICATIONS_URL}/read`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.email, ids }),
    }).catch(() => {});
  };

  // Clear notifications: hide them right away, then delete on the server
  const clear = (ids, all) => {
    if (!user) return;
    setItems((prev) => (all ? [] : prev.filter((n) => !ids.includes(n.id))));
    const email = encodeURIComponent(user.email || "");
    if (all) {
      fetch(`${NOTIFICATIONS_URL}?email=${email}`, { method: "DELETE" }).catch(() => {});
    } else {
      ids.forEach((id) =>
        fetch(`${NOTIFICATIONS_URL}/${id}?email=${email}`, { method: "DELETE" }).catch(() => {})
      );
    }
  };

  return [items, markRead, () => setTick((t) => t + 1), clear];
}

// ----------------------------------------------------
// HEADER
// ----------------------------------------------------

export default function Header() {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const user = useLoggedInUser();
  const [serverNotifications, markServerRead, reloadNotifications, clearServerNotifications] =
    useServerNotifications(user);

  // HEADER SCROLL EFFECT
  useEffect(() => {
    const f = () => setSolid(window.scrollY > 60);
    f();
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);

  // CLOSE MOBILE MENU
  const closeMenu = () => setOpen(false);

  return (
    <header className={`header ${solid ? "solid" : ""} ${open ? "open" : ""}`}>
      <div className="header-in">
        {/* LOGO */}
        <Logo />

        {/* NAVIGATION */}
        <nav className="nav" onClick={closeMenu}>
          {LINKS.map(([title, path], index) => (
            <Link key={title} to={path} className={index === 0 ? "active" : ""}>
              {title}
            </Link>
          ))}

          {/* SOCIAL */}
          <span className="socials">
            <Social d="M14 8h3V4h-3a4 4 0 0 0-4 4v2H7v4h3v8h4v-8h3l1-4h-4V8z" />
            <Social d="M3 3h18v18H3zM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM17.5 6.5h.01" />
            <Social d="M22 5.9a8 8 0 0 1-2.4.7 4 4 0 0 0 1.8-2.3 8 8 0 0 1-2.6 1A4 4 0 0 0 11.9 9 11.4 11.4 0 0 1 3.6 4.8a4 4 0 0 0 1.3 5.4 4 4 0 0 1-1.8-.5 4 4 0 0 0 3.2 4 4 4 0 0 0-1.8.1 4 4 0 0 0 3.7 2.8A8 8 0 0 1 2 18.2 11.4 11.4 0 0 0 8.2 20c7.5 0 11.7-6.2 11.7-11.6v-.5A8 8 0 0 0 22 5.9z" />
          </span>
        </nav>

        {/* RIGHT SIDE */}
        <div className="header-r">
          <a className="phone" href="tel:18003216543">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
            </svg>
            1-800-321-6543
          </a>

          {/* NOTIFICATION BELL: only when logged in */}
          {user && (
            <NotificationBell
              userId={user._id || user.id || user.email}
              extra={serverNotifications}
              onRead={markServerRead}
              onOpen={reloadNotifications}
              onClear={clearServerNotifications}
            />
          )}

          {/* PROFILE ICON: Login / Register dropdown */}
          <ProfileMenu />
        </div>

        {/* MOBILE MENU */}
        <button
          className="burger"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
          aria-expanded={open}
        >
          <i />
          <i />
          <i />
        </button>
      </div>
    </header>
  );
}