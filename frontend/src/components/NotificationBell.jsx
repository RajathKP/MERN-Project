import { useEffect, useMemo, useRef, useState } from "react";
import "./NotificationBell.css";

// Notification bell for the signed-in traveller.
//
// Usage (inside your navbar, only render when the user is logged in):
//   {user && (
//     <NotificationBell
//       userId={user._id}
//       bookings={bookings}
//       taxiBookings={taxiBookings}
//       extra={serverNotifications}   // optional: [{ id, title, message, date, tone }]
//     />
//   )}
//
// Notifications are derived from the user's bookings (same rules as OverviewCard),
// plus anything you pass in `extra` (e.g. from your own /api/notifications endpoint).
// Read state is remembered per user in localStorage.

const DAY = 24 * 60 * 60 * 1000;

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const isCancelled = (b) => ["cancelled", "canceled"].includes((b.status || "").toLowerCase());

const fmtDate = (d) => {
  const date = new Date(d);
  return isNaN(date) ? "" : date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
};

export function buildBookingNotifications(bookings = [], taxiBookings = null) {
  const today = startOfToday();
  const list = [];

  bookings
    .filter((b) => !isCancelled(b))
    .forEach((b) => {
      const key = b._id || `${b.tourTitle}-${b.travelDate}`;
      const title = b.tourTitle || "your tour";
      const paid = (b.paymentStatus || "").toLowerCase() === "paid";
      const travel = b.travelDate ? new Date(b.travelDate) : null;
      const upcoming = travel && travel >= today;

      if (!paid) {
        list.push({
          id: `unpaid-${key}`,
          tone: "warn",
          title: "Payment pending",
          message: `Complete payment for ${title} to confirm your booking.`,
          date: b.travelDate,
        });
      }

      if (upcoming) {
        const days = Math.ceil((travel - today) / DAY);
        if (days <= 7) {
          list.push({
            id: `soon-${key}`,
            tone: "good",
            title: days === 0 ? "Your trip is today" : days === 1 ? "Your trip is tomorrow" : `Trip in ${days} days`,
            message: `${title} on ${fmtDate(b.travelDate)}. Check your documents.`,
            date: b.travelDate,
          });
        }
      }
    });

  if (Array.isArray(taxiBookings)) {
    taxiBookings
      .filter((t) => !isCancelled(t))
      .forEach((t, i) => {
        const when = t.pickupDate || t.date || t.travelDate;
        if (!when) return;
        const date = new Date(when);
        const days = Math.ceil((date - today) / DAY);
        if (date >= today && days <= 2) {
          list.push({
            id: `taxi-${t._id || i}`,
            tone: "good",
            title: days === 0 ? "Taxi pickup today" : "Taxi pickup soon",
            message: `Your taxi is scheduled for ${fmtDate(when)}.`,
            date: when,
          });
        }
      });
  }

  return list;
}

// onRead(ids): optional, called when the user reads notifications so the server can save it.
// onOpen(): optional, called each time the panel is opened so the parent can refresh the list.
// onClear(ids, all): optional, called when the user clears notifications so the server can delete them.
export default function NotificationBell({ userId = "guest", bookings = [], taxiBookings = null, extra = [], onRead, onOpen, onClear }) {
  const storageKey = `travelu-read-notifications-${userId}`;
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState([]);
  const wrapRef = useRef(null);

  // ids the user has cleared (remembered per user, so cleared items stay hidden)
  const clearKey = `travelu-cleared-notifications-${userId}`;
  const [clearedIds, setClearedIds] = useState([]);

  useEffect(() => {
    try {
      setClearedIds(JSON.parse(localStorage.getItem(clearKey)) || []);
    } catch {
      setClearedIds([]);
    }
  }, [clearKey]);

  const persistCleared = (ids) => {
    setClearedIds(ids);
    try {
      localStorage.setItem(clearKey, JSON.stringify(ids));
    } catch {
      /* storage unavailable: cleared items only stay hidden for this page view */
    }
  };

  // load read state
  useEffect(() => {
    try {
      setReadIds(JSON.parse(localStorage.getItem(storageKey)) || []);
    } catch {
      setReadIds([]);
    }
  }, [storageKey]);

  const persist = (ids) => {
    setReadIds(ids);
    try {
      localStorage.setItem(storageKey, JSON.stringify(ids));
    } catch {
      /* storage unavailable: read state just lasts for this page view */
    }
  };

  const allNotifications = useMemo(
    () => [...extra, ...buildBookingNotifications(bookings, taxiBookings)],
    [extra, bookings, taxiBookings]
  );
  const notifications = allNotifications.filter((n) => !clearedIds.includes(n.id));

  const isRead = (n) => n.read === true || readIds.includes(n.id);
  const unread = notifications.filter((n) => !isRead(n));
  const markRead = (id) => {
    if (readIds.includes(id)) return;
    persist([...readIds, id]);
    onRead?.([id]);
  };
  const markAllRead = () => {
    persist([...new Set([...readIds, ...notifications.map((n) => n.id)])]);
    onRead?.(unread.map((n) => n.id));
  };

  const clearOne = (id) => {
    persistCleared([...new Set([...clearedIds, id])]);
    onClear?.([id], false);
  };
  const clearAll = () => {
    persistCleared([...new Set([...clearedIds, ...notifications.map((n) => n.id)])]);
    onClear?.(notifications.map((n) => n.id), true);
  };

  // close on outside click / Escape
  useEffect(() => {
    if (!open) return;
    const onClick = (e) => wrapRef.current && !wrapRef.current.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="nb-wrap" ref={wrapRef}>
      <button
        type="button"
        className="nb-bell"
        aria-label={`Notifications${unread.length ? `, ${unread.length} unread` : ""}`}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => {
          if (!open) onOpen?.();
          setOpen((o) => !o);
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unread.length > 0 && <span className="nb-badge">{unread.length > 9 ? "9+" : unread.length}</span>}
      </button>

      {open && (
        <div className="nb-panel" role="dialog" aria-label="Notifications">
          <div className="nb-panel-head">
            <strong>Notifications</strong>
            <span className="nb-actions">
              {unread.length > 0 && (
                <button type="button" className="nb-link" onClick={markAllRead}>
                  Mark all as read
                </button>
              )}
              {notifications.length > 0 && (
                <button type="button" className="nb-link nb-clear" onClick={clearAll}>
                  Clear all
                </button>
              )}
            </span>
          </div>

          {notifications.length === 0 ? (
            <p className="nb-empty">You're all caught up. No notifications right now.</p>
          ) : (
            <ul className="nb-list">
              {notifications.map((n) => {
                const isUnread = !isRead(n);
                return (
                  <li key={n.id} className="nb-row">
                    <button
                      type="button"
                      className={`nb-item nb-${n.tone || "neutral"} ${isUnread ? "unread" : ""}`}
                      onClick={() => markRead(n.id)}
                    >
                      <span className="nb-dot" aria-hidden="true" />
                      <span className="nb-text">
                        <span className="nb-title">{n.title}</span>
                        <span className="nb-msg">{n.message}</span>
                      </span>
                    </button>
                    <button
                      type="button"
                      className="nb-dismiss"
                      aria-label={`Clear notification: ${n.title}`}
                      title="Clear"
                      onClick={() => clearOne(n.id)}
                    >
                      &times;
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}