import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";
import Scene from "./Scene.jsx";

import "./Checkoutpage.css";

const BOOKINGS_API = "https://mern-project-htye.onrender.com/api/bookings";

const inr = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

const fmtDate = (d) => {
  const date = new Date(d);
  return isNaN(date) ? d || "—" : date.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });
};

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("bookingId");

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");
  const [done, setDone] = useState(false);

  // load the booking so the summary and totals come from the server
  useEffect(() => {
    if (!bookingId) {
      setLoading(false);
      setError("No booking selected. Choose a tour to start a booking.");
      return;
    }
    const c = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setError("");
        const token = localStorage.getItem("token");
        const res = await fetch(`${BOOKINGS_API}/${bookingId}`, {
          signal: c.signal,
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.status === 404) throw new Error("This booking could not be found.");
        if (!res.ok) throw new Error(`Server error (${res.status})`);
        setBooking(await res.json());
      } catch (err) {
        if (err.name !== "AbortError") setError(err.message || "Unable to load your booking.");
      } finally {
        setLoading(false);
      }
    })();
    return () => c.abort();
  }, [bookingId]);

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();

  const isPaid = booking?.paymentStatus === "paid";
  const guests = Number(booking?.guests) || 1;
  const total = Number(booking?.totalPrice) || 0;
  const unitPrice = guests ? total / guests : 0;

  const pay = () => {
    setPayError("");
    setPaying(true);
    startPayment({
      bookingId,
      prefill: { name: user?.name, email: user?.email, phone: user?.phone },
      onSuccess: () => {
        setPaying(false);
        setDone(true);
      },
      onError: (err) => {
        setPaying(false);
        setPayError(err.message || "Payment failed. Please try again.");
      },
    });
  };

  const body = () => {
    if (loading) return <p className="co-status">Loading your booking...</p>;

    if (error) {
      return (
        <div className="co-state">
          <p>{error}</p>
          <Link to="/" className="btn coral">BACK TO TOURS</Link>
        </div>
      );
    }

    if (done || isPaid) {
      return (
        <div className="co-state co-success">
          <div className="co-check" aria-hidden="true">✓</div>
          <h2>Payment successful</h2>
          <p>
            Your trip to <b>{booking?.tourTitle}</b> is confirmed. A receipt will be sent to{" "}
            <b>{booking?.email}</b>.
          </p>
          <button type="button" className="btn coral" onClick={() => navigate("/dashboard?tab=bookings")}>
            VIEW MY BOOKINGS
          </button>
        </div>
      );
    }

    return (
      <div className="co-layout">
        {/* ---- summary ---- */}
        <section className="co-card">
          <h2>Trip details</h2>
          <div className="co-trip">
            <div className="co-thumb">
              <Scene kind={booking.scene} image={booking.image} alt={booking.tourTitle} />
            </div>
            <div>
              <h3>{booking.tourTitle}</h3>
              {booking.destinationName && <p className="co-muted">{booking.destinationName}</p>}
            </div>
          </div>

          <dl className="co-list">
            <div>
              <dt>Travel date</dt>
              <dd>{fmtDate(booking.travelDate)}</dd>
            </div>
            <div>
              <dt>Travellers</dt>
              <dd>
                {guests} guest{guests === 1 ? "" : "s"}
              </dd>
            </div>
            <div>
              <dt>Lead traveller</dt>
              <dd>{booking.name}</dd>
            </div>
            <div>
              <dt>Contact</dt>
              <dd>{booking.email}</dd>
            </div>
          </dl>
        </section>

        {/* ---- payment ---- */}
        <aside className="co-card co-pay">
          <h2>Payment summary</h2>
          <div className="co-row">
            <span>
              {inr(unitPrice)} × {guests} guest{guests === 1 ? "" : "s"}
            </span>
            <span>{inr(total)}</span>
          </div>
          <div className="co-row co-tax">
            <span>Taxes &amp; fees</span>
            <span>Included</span>
          </div>
          <div className="co-total">
            <span>Total</span>
            <strong>{inr(total)}</strong>
          </div>

          {payError && (
            <p className="co-error" role="alert">
              {payError}
            </p>
          )}

          <button type="button" className="co-pay-btn" onClick={pay} disabled={paying || total <= 0}>
            {paying ? "OPENING PAYMENT..." : `PAY ${inr(total)}`}
          </button>

          <p className="co-secure">🔒 Payments are processed securely by Razorpay.</p>
        </aside>
      </div>
    );
  };

  return (
    <>
      <Header />
      <div className="co-topbar" />
      <main className="wrap co-page">
        <nav className="co-steps" aria-label="Booking progress">
          <span className="done">1. Trip</span>
          <span className={isPaid || done ? "done" : "on"}>2. Payment</span>
          <span className={isPaid || done ? "on" : ""}>3. Confirmed</span>
        </nav>

        <h1>Checkout</h1>
        {body()}
      </main>
      <Footer />
    </>
  );
}