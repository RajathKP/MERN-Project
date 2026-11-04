import React, { useEffect, useState } from "react";
import "./AdminDashboard.css"; // change the path if your CSS file lives elsewhere
import "./Destinations.css";

const API = "http://localhost:5000/api/tours";

const Destinations = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const response = await fetch(API);
        if (!response.ok) throw new Error("Unable to fetch tours");

        const data = await response.json();
        if (!Array.isArray(data)) throw new Error("Invalid response from backend");

        setTours(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTours();
  }, []);

  let content;

  if (loading) {
    content = <p className="destinations-status">Loading destinations...</p>;
  } else if (error) {
    content = (
      <p className="destinations-status destinations-error">{error}</p>
    );
  } else if (tours.length === 0) {
    content = <p className="destinations-status">No destinations found</p>;
  } else {
    content = (
      <div className="destination-grid">
        {tours.map((tour) => {
          const location = [tour.city, tour.region].filter(Boolean).join(", ");

          return (
            <div className="destination-card" key={tour._id}>
              <div className="destination-media">
                <img src={tour.image} alt={tour.title} />
                {tour.type && (
                  <span className="destination-badge">{tour.type}</span>
                )}
              </div>

              <div className="destination-info">
                <h3>{tour.title}</h3>
                <p>📍 {location}</p>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="destinations-page">
      <div className="destinations-header">
        <h2>Destinations</h2>
        {!loading && !error && (
          <p>{tours.length} places available</p>
        )}
      </div>

      {content}
    </div>
  );
};

export default Destinations;