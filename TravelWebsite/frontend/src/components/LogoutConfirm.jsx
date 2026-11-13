import { useEffect } from "react";
import "./LogoutConfirm.css";

// Asks the user to confirm before they are logged out.
export default function LogoutConfirm({ onConfirm, onCancel }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onCancel();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onCancel]);

  return (
    <div className="lc-overlay" onMouseDown={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="lc-modal" role="alertdialog" aria-modal="true" aria-labelledby="lc-title" aria-describedby="lc-desc">
        <div className="lc-icon" aria-hidden="true">!</div>
        <h2 id="lc-title">Log out of Travelu?</h2>
        <p id="lc-desc">
          You'll need to log in again to see your bookings, manage your profile, or pay for trips.
        </p>

        <div className="lc-actions">
          <button type="button" className="lc-cancel" onClick={onCancel} autoFocus>
            Stay logged in
          </button>
          <button type="button" className="lc-confirm" onClick={onConfirm}>
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}