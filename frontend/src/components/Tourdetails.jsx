
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";
import BookingModal from "./BookingModal.jsx";
import "./TourDetails.css";

const API = "http://localhost:6001/api/tours";

/* Convert array or newline-separated text into an array */
const toList = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

/* Safely read JSON */
const readJson = async (response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const TourDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [openDay, setOpenDay] = useState(0);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const loadTour = async () => {
      try {
        setLoading(true);
        setError("");
        setTour(null);
        setOpenDay(0);

        /*
         * First try:
         * GET /api/tours/:id
         */
        const response = await fetch(`${API}/${id}`, {
          signal: controller.signal,
        });

        let found = null;

        if (response.ok) {
          const data = await readJson(response);

          if (data) {
            found = data.tour || data.data || data;
          }
        }

        /*
         * Fallback:
         * GET /api/tours
         */
        if (!found || !found._id) {
          const listResponse = await fetch(API, {
            signal: controller.signal,
          });

          if (!listResponse.ok) {
            throw new Error("Unable to load tours");
          }

          const data = await readJson(listResponse);

          const tours = Array.isArray(data)
            ? data
            : Array.isArray(data?.tours)
            ? data.tours
            : Array.isArray(data?.data)
            ? data.data
            : [];

          found =
            tours.find(
              (item) =>
                String(item._id) === String(id) ||
                String(item.id) === String(id)
            ) || null;
        }

        if (!found) {
          throw new Error("Tour not found");
        }

        setTour(found);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Unable to load tour");
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadTour();
    } else {
      setError("Invalid tour ID");
      setLoading(false);
    }

    return () => controller.abort();
  }, [id]);

  /* ---------------- Loading / Error ---------------- */

  if (loading || error || !tour) {
    return (
      <>
        <Header onSignIn={() => navigate("/login")} />

        <div className="td-page">
          <div className="td-status">
            {loading && <p>Loading tour...</p>}

            {!loading && (error || !tour) && (
              <>
                <p>{error || "Tour not found"}</p>

                <Link to="/" className="td-back">
                  ← Back to home
                </Link>
              </>
            )}
          </div>
        </div>

        <Footer />
      </>
    );
  }

  /* ---------------- Derived Data ---------------- */

  const days = Number(tour.days) || 0;
  const nights = days > 0 ? days - 1 : 0;

  const location = [
    tour.city,
    tour.district,
    tour.region,
    tour.country,
  ]
    .filter(Boolean)
    .join(", ");

  /* Included items */

  const included = tour.included || {};

  const hotelStars = Number(tour.hotelStars) || 0;

  const includedItems = [
    included.flight && {
      icon: "✈️",
      label: "Flight",
    },

    included.transfers && {
      icon: "🚗",
      label: "Transfers",
    },

    included.meals && {
      icon: "🍽️",
      label: "Meals",
    },

    included.activities && {
      icon: "🎯",
      label: "Activities",
    },

    hotelStars > 0 && {
      icon: "🏨",
      label: `${hotelStars} Star Hotel`,
    },
  ].filter(Boolean);

  /* Lists */

  const activities = toList(tour.activities);
  const inclusions = toList(tour.inclusions);
  const exclusions = toList(tour.exclusions);

  /* Itinerary */

  const itinerary = Array.isArray(tour.itinerary)
    ? tour.itinerary
    : [];

  /* Price */

  const price = Number(tour.price) || 0;

  const oldPrice =
    Number(tour.oldPrice) ||
    Number(tour.was) ||
    0;

  const hasDiscount =
    oldPrice > 0 && oldPrice > price;

  return (
    <>
      <Header onSignIn={() => navigate("/login")} />

      <main className="td-page">

        {/* Back */}

        <Link to="/" className="td-back">
          ← Back
        </Link>

        {/* Title */}

        <h1 className="td-title">
          {tour.title}
        </h1>

        {/* Subtitle */}

        <p className="td-sub">

          {tour.type && (
            <span className="td-badge">
              {tour.type}
            </span>
          )}

          {location && (
            <span>
              📍 {location}
            </span>
          )}

          {Number(tour.rating) > 0 && (
            <span>
              ⭐ {tour.rating}
            </span>
          )}

        </p>

        {/* ---------------- Hero + Price ---------------- */}

        <div className="td-top">

          <div className="td-hero">
            {tour.image ? (
              <img
                src={tour.image}
                alt={tour.title}
              />
            ) : (
              <div className="td-no-image">
                No image available
              </div>
            )}
          </div>

          <aside className="td-price-card">

            <div className="td-price-row">

              <span className="td-muted">
                Starts at per person
              </span>

              <div className="td-price-values">

                {hasDiscount && (
                  <span className="td-old-price">
                    ${oldPrice}
                  </span>
                )}

                <strong className="td-price">
                  ${price}
                </strong>

              </div>
            </div>

            {/* Duration */}

            {days > 0 && (
              <div className="td-duration">
                {nights}N / {days}D
                <span> (Night/Day)</span>
              </div>
            )}

            {/* Included */}

            {includedItems.length > 0 && (
              <div className="td-included">

                <span className="td-included-title">
                  Included
                </span>

                <div className="td-included-list">

                  {includedItems.map((item) => (
                    <div
                      className="td-included-item"
                      key={item.label}
                    >
                      <span className="td-included-icon">
                        {item.icon}
                      </span>

                      <span>
                        {item.label}
                      </span>
                    </div>
                  ))}

                </div>
              </div>
            )}

            {/* Book */}

            <button
              className="td-enquire"
              onClick={() => setBooking(true)}
            >
              Book Now
            </button>

          </aside>
        </div>

        {/* ---------------- About ---------------- */}

        {tour.description && (
          <section className="td-section">

            <h2>
              About this tour
            </h2>

            <p className="td-about">
              {tour.description}
            </p>

          </section>
        )}

        {/* ---------------- Activities ---------------- */}

        {activities.length > 0 && (
          <section className="td-section">

            <h2>
              Activities
            </h2>

            <div className="td-activities">

              {activities.map((activity, index) => (
                <div
                  className="td-activity"
                  key={`${activity}-${index}`}
                >
                  <span>🎯</span>

                  <span>
                    {activity}
                  </span>
                </div>
              ))}

            </div>

          </section>
        )}

        {/* ---------------- Itinerary ---------------- */}

        {itinerary.length > 0 && (
          <section className="td-section">

            <h2>
              Itinerary
            </h2>

            <div className="td-itinerary">

              {itinerary.map((day, index) => {

                const open =
                  openDay === index;

                const title =
                  day?.title ||
                  `Day ${index + 1}`;

                const description =
                  day?.description ||
                  "Details coming soon.";

                return (
                  <div
                    className={`td-day ${
                      open ? "open" : ""
                    }`}
                    key={`${title}-${index}`}
                  >

                    <button
                      type="button"
                      className="td-day-head"
                      onClick={() =>
                        setOpenDay(
                          open ? -1 : index
                        )
                      }
                      aria-expanded={open}
                    >

                      <span>
                        Day {index + 1} - {title}
                      </span>

                      <span className="td-chevron">
                        {open ? "▴" : "▾"}
                      </span>

                    </button>

                    {open && (
                      <div className="td-day-body">
                        {description}
                      </div>
                    )}

                  </div>
                );
              })}

            </div>

          </section>
        )}

        {/* ---------------- Inclusions / Exclusions ---------------- */}

        {(inclusions.length > 0 ||
          exclusions.length > 0) && (

          <section className="td-section">

            <h2>
              Here's a list of package
              inclusions & exclusions for you
            </h2>

            <div className="td-columns">

              {/* Inclusions */}

              {inclusions.length > 0 && (
                <div className="td-column">

                  <span className="td-pill">
                    Inclusions
                  </span>

                  <ul>
                    {inclusions.map(
                      (item, index) => (
                        <li
                          key={`${item}-${index}`}
                        >
                          {item}
                        </li>
                      )
                    )}
                  </ul>

                </div>
              )}

              {/* Exclusions */}

              {exclusions.length > 0 && (
                <div className="td-column td-column-muted">

                  <span className="td-pill">
                    Exclusions
                  </span>

                  <ul>
                    {exclusions.map(
                      (item, index) => (
                        <li
                          key={`${item}-${index}`}
                        >
                          {item}
                        </li>
                      )
                    )}
                  </ul>

                </div>
              )}

            </div>

          </section>
        )}

      </main>

      <Footer />

      {/* Booking Modal */}

      {booking && (
        <BookingModal
          tour={tour}
          onClose={() => setBooking(false)}
        />
      )}
    </>
  );
};

export default TourDetails;
