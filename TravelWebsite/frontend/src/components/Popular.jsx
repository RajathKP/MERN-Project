import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Scene from "./Scene.jsx";
import { Carousel, Stars, ClockIcon, money } from "./common.jsx";
import { OurDestinations } from "./Destinations.jsx";

const API = "http://localhost:5000/api/tours";

export default function Popular({ onPick }) {
  const navigate = useNavigate();

  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Open the tour details page
  const openTour = (tour) => navigate(`/tours/${tour._id || tour.id}`);

  // FETCH TOURS FROM MONGODB API
  useEffect(() => {
    const fetchTours = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(API);

        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }

        const data = await response.json();

        const tourData = Array.isArray(data)
          ? data
          : data.tours || [];

        setTours(tourData);
      } catch (err) {
        console.error("Failed to fetch popular tours:", err);
        setError("Unable to load popular tours.");
      } finally {
        setLoading(false);
      }
    };

    fetchTours();
  }, []);

  // POPULAR TOURS
  // Tours with rating 4 or higher
  const list = tours
    .filter((tour) => Number(tour.rating || 0) >= 4)
    .slice(0, 8);

  return (
    <>
      {/* ================= POPULAR TOURS ================= */}
      <section className="popular" id="popular">
        <Scene
          kind="italy"
          className="pop-bg"
        />

        <div className="pop-shade" />

        <div className="wrap pop-in">
          <div className="pop-head">
            <h2>
              Popular Tours

              <svg
                className="wave"
                width="40"
                height="10"
                viewBox="0 0 40 10"
                fill="none"
                stroke="#fff"
                strokeWidth="2"
              >
                <path
                  d="M1 8 L6 2 L11 8 L16 2 L21 8 L26 2 L31 8 L36 2 L39 6"
                  strokeLinejoin="round"
                />
              </svg>
            </h2>

            <a
              href="#tours"
              onClick={() => onPick("")}
              className="all-tours"
            >
              <u>ALL TOURS</u>
            </a>
          </div>

          {/* LOADING */}
          {loading && (
            <p className="loading">
              Loading popular tours...
            </p>
          )}

          {/* ERROR */}
          {error && (
            <p className="error">
              {error}
            </p>
          )}

          {/* POPULAR TOURS */}
          {!loading && !error && list.length > 0 && (
            <Carousel
              className="pop-car"
              items={list.map((tour) => ({
                ...tour,
                id: tour._id || tour.id,
              }))}
              render={(t) => {
                const was = Number(t.oldPrice || t.was) || 0;
                const hasDiscount = was > Number(t.price);

                return (
                  <article
                    className="pcard"
                    onClick={() => openTour(t)}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        openTour(t);
                      }
                    }}
                  >
                    {/* IMAGE */}
                    <div className="pcard-img">
                      <Scene
                        kind={t.scene || "default"}
                        image={t.image}
                        alt={t.title}
                      />

                      {/* DISCOUNT */}
                      {hasDiscount && (
                        <span className="tag">
                          {Math.round(
                            (1 - Number(t.price) / was) * 100
                          )}
                          % Off
                        </span>
                      )}
                    </div>

                    {/* BODY */}
                    <div className="pcard-body">
                      <h3>{t.title}</h3>

                      <p>
                        {t.description || "Explore this amazing destination with TravelU."}
                      </p>

                      {/* LOCATION */}
                      <small className="tour-location">
                        {t.city}
                        {t.district ? `, ${t.district}` : ""}
                        {t.region ? `, ${t.region}` : ""}
                      </small>
                    </div>

                    {/* FOOTER */}
                    <div className="pcard-foot">
                      <div>
                        {/* DURATION */}
                        <span className="dur">
                          <ClockIcon />
                          {t.days || 1} Days
                        </span>

                        {/* RATING */}
                        <div className="rv">
                          <Stars
                            n={Number(t.rating || 0)}
                          />

                          <small>
                            {Number(t.rating || 0).toFixed(1)}
                          </small>
                        </div>
                      </div>

                      {/* PRICE */}
                      <div className="price">
                        {hasDiscount ? (
                          <s>
                            {money(was)}
                          </s>
                        ) : (
                          <small>
                            From
                          </small>
                        )}

                        <b>
                          {money(Number(t.price) || 0)}
                        </b>
                      </div>
                    </div>
                  </article>
                );
              }}
            />
          )}

          {/* NO TOURS */}
          {!loading &&
            !error &&
            list.length === 0 && (
              <p>
                No popular tours available.
              </p>
            )}
        </div>
      </section>

      {/* ================= DESTINATIONS ================= */}
      <section className="section">
        <OurDestinations
          onPick={onPick}
        />
      </section>
    </>
  );
}