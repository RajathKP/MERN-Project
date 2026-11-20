import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import BookingModal from "./BookingModal.jsx"; // adjust the path to your existing modal
import "./Destinationdetails.css";

const API_BASE = "https://mern-project-htye.onrender.com";
const DEST_API = `https://mern-project-htye.onrender.com/api/destinations`;
const TOURS_API = `https://mern-project-htye.onrender.com/api/tours`;
const CATEGORY_API = `https://mern-project-htye.onrender.com/api/categories`;
const CURRENCY = "$"; // change to "₹" if your prices are in rupees

const money = (n) => `${CURRENCY}${Number(n || 0).toLocaleString()}`;

const fetchList = async (url, signal) => {
  try {
    const res = await fetch(url, { signal });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    if (err.name === "AbortError") throw err;
    return [];
  }
};

const Destinationdetails = () => {
  const { id } = useParams();

  const [destination, setDestination] = useState(null);
  const [tours, setTours] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openDay, setOpenDay] = useState(0);
  const [booking, setBooking] = useState(null); // tour being booked, or null

  const load = async (signal) => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(DEST_API, { signal });
      if (!response.ok) throw new Error("Unable to load this destination");
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error("Invalid response from backend");

      setDestination(data.find((d) => d._id === id) || null);
      setTours(await fetchList(TOURS_API, signal));
      setCategories(await fetchList(CATEGORY_API, signal));
    } catch (err) {
      if (err.name !== "AbortError") setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    window.scrollTo(0, 0);
    return () => controller.abort();
  }, [id]);

  if (loading) {
    return (
      <section className="dd-page">
        <p className="dd-status">Loading destination...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="dd-page">
        <div className="dd-status dd-error">
          {error}
          <button onClick={() => load()}>Retry</button>
        </div>
      </section>
    );
  }

  if (!destination) {
    return (
      <section className="dd-page">
        <p className="dd-status">Destination not found.</p>
        <Link to="/" className="dd-back">
          ← Back to destinations
        </Link>
      </section>
    );
  }

  const categoryName =
    destination.category && typeof destination.category === "object"
      ? destination.category.name || ""
      : categories.find((c) => c._id === destination.category)?.name || "";

  const location = [destination.district, destination.region]
    .filter(Boolean)
    .join(", ");

  // Tour packages whose city matches this destination
  const key = (destination.name || "").trim().toLowerCase();
  const relatedTours = tours.filter(
    (t) => (t.city || "").trim().toLowerCase() === key
  );

  // Cheapest package drives the price card and the sample itinerary
  const featured = relatedTours.length
    ? [...relatedTours].sort(
        (a, b) => (Number(a.price) || 0) - (Number(b.price) || 0)
      )[0]
    : null;

  // Unique activities across all packages
  const activities = [
    ...new Set(
      relatedTours.flatMap((t) => (Array.isArray(t.activities) ? t.activities : []))
    ),
  ];

  const itinerary = Array.isArray(featured?.itinerary) ? featured.itinerary : [];
  const included = featured?.included || {};
  const includedItems = [
    included.flight && { icon: "✈️", label: "Flights" },
    included.transfers && { icon: "🚗", label: "Transfers" },
    included.meals && { icon: "🍽️", label: "Meals" },
    included.activities && { icon: "🎯", label: "Activities" },
    featured?.hotelStars > 0 && {
      icon: "🏨",
      label: `${featured.hotelStars} Star Hotel`,
    },
  ].filter(Boolean);

  const days = Number(featured?.days) || 0;
  const duration = days ? `${Math.max(days - 1, 1)}N/${days}D` : "";

  const openBooking = (tour) => setBooking(tour);

  return (
    <section className="dd-page">
      <Link to="/" className="dd-back">
        ← Back to destinations
      </Link>

      <h1 className="dd-title">{destination.name}</h1>
      {(categoryName || location) && (
        <p className="dd-sub">
          {categoryName && <span className="dd-badge">{categoryName}</span>}
          {location && <span>📍 {location}</span>}
        </p>
      )}

      <div className="dd-layout">
        <div className="dd-main">
          <div className="dd-hero">
            {destination.image && (
              <img src={destination.image} alt={destination.name} />
            )}
          </div>

          <h2>About {destination.name}</h2>
          <p className="dd-description">
            {destination.description || "No description has been added yet."}
          </p>

          {activities.length > 0 && (
            <>
              <h2>Activities</h2>
              <ul className="dd-activities">
                {activities.map((a) => (
                  <li key={a}>
                    <span aria-hidden="true">📍</span>
                    {a}
                  </li>
                ))}
              </ul>
            </>
          )}

          {itinerary.length > 0 && (
            <>
              <h2>Itinerary</h2>
              <p className="dd-note">From the “{featured.title}” package</p>
              <div className="dd-itinerary">
                {itinerary.map((day, i) => {
                  const open = openDay === i;
                  return (
                    <div className={`dd-day ${open ? "open" : ""}`} key={i}>
                      <button
                        type="button"
                        className="dd-day-head"
                        onClick={() => setOpenDay(open ? -1 : i)}
                        aria-expanded={open}
                      >
                        <span>{day.title}</span>
                        <span className="dd-chevron">⌄</span>
                      </button>
                      {open && day.description && (
                        <p className="dd-day-body">{day.description}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          <h2 id="dd-tours">Tour packages in {destination.name}</h2>
          {relatedTours.length === 0 ? (
            <p className="dd-status">
              No tour packages are available for this destination yet.
            </p>
          ) : (
            <div className="dd-tours">
              {relatedTours.map((tour) => (
                <article className="dd-tour" key={tour._id}>
                  {tour.image && <img src={tour.image} alt={tour.title} />}
                  <div className="dd-tour-body">
                    {tour.type && <span className="dd-badge">{tour.type}</span>}
                    <h3>{tour.title}</h3>
                    <p>
                      {tour.days ? `${tour.days} days` : ""}
                      {tour.days && tour.rating ? " · " : ""}
                      {tour.rating ? `⭐ ${tour.rating}` : ""}
                    </p>
                    <strong>{money(tour.price)}</strong>
                    <div>
                      <button
                        type="button"
                        className="dd-book"
                        onClick={() => openBooking(tour)}
                      >
                        Book This Tour
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {featured && (
          <aside className="dd-side">
            <div className="dd-price-card">
              <div className="dd-price-row">
                <span className="dd-muted">Starts at per person</span>
                <div className="dd-price-col">
                  {Number(featured.oldPrice) > Number(featured.price) && (
                    <s>{money(featured.oldPrice)}</s>
                  )}
                  <strong>{money(featured.price)}</strong>
                </div>
              </div>

              {duration && (
                <p className="dd-duration">{duration} (Night/Day)</p>
              )}

              {includedItems.length > 0 && (
                <>
                  <p className="dd-included-title">Included</p>
                  <div className="dd-included">
                    {includedItems.map((item) => (
                      <div key={item.label}>
                        <span aria-hidden="true">{item.icon}</span>
                        <small>{item.label}</small>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <button
                type="button"
                className="dd-cta"
                onClick={() => openBooking(featured)}
              >
                Book Now
              </button>
            </div>
          </aside>
        )}
      </div>

      {booking && (
        <BookingModal tour={booking} onClose={() => setBooking(null)} />
      )}
    </section>
  );
};

export default Destinationdetails;