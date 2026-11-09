import React, { useEffect, useMemo, useState } from "react";
import "./Places.css";

const DEST_API = "http://localhost:5000/api/destinations";
const TOURS_API = "http://localhost:5000/api/tours";

const Places = () => {
  const [places, setPlaces] = useState([]);
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState("All");

  const fetchPlaces = async (signal) => {
    try {
      setLoading(true);
      setError("");

      // Destinations added from the admin "Destinations" tab
      const response = await fetch(DEST_API, { signal });
      if (!response.ok) throw new Error("Unable to fetch places");

      const data = await response.json();
      if (!Array.isArray(data)) throw new Error("Invalid response from backend");

      setPlaces(data);

      // Tours are optional: used only to show tour count / starting price
      try {
        const tourResponse = await fetch(TOURS_API, { signal });
        if (tourResponse.ok) {
          const tourData = await tourResponse.json();
          if (Array.isArray(tourData)) setTours(tourData);
        }
      } catch (tourErr) {
        if (tourErr.name === "AbortError") throw tourErr;
      }
    } catch (err) {
      if (err.name !== "AbortError") setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchPlaces(controller.signal);
    return () => controller.abort();
  }, []);

  const regions = useMemo(
    () => ["All", ...new Set(places.map((p) => p.region).filter(Boolean))],
    [places]
  );

  // Tours whose city matches the destination name
  const tourInfo = (place) => {
    const name = (place.name || "").trim().toLowerCase();
    const matching = tours.filter(
      (t) => (t.city || "").trim().toLowerCase() === name
    );
    if (matching.length === 0) return null;

    return {
      count: matching.length,
      from: Math.min(...matching.map((t) => Number(t.price) || 0)),
    };
  };

  const filteredPlaces = places.filter((place) => {
    const matchesRegion =
      regionFilter === "All" || place.region === regionFilter;
    const text = `${place.name || ""} ${place.district || ""} ${
      place.region || ""
    }`.toLowerCase();
    return matchesRegion && text.includes(search.toLowerCase());
  });

  return (
    <section className="places-section" id="places">
      <div className="places-header">
        <div>
          <h2>Explore our Destinations</h2>
          {!loading && !error && (
            <p>
              {filteredPlaces.length} of {places.length} places
            </p>
          )}
        </div>

        <div className="places-controls">
          <input
            type="text"
            className="places-search"
            placeholder="Search by name, district or region..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="places-filter"
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
          >
            {regions.map((region) => (
              <option key={region} value={region}>
                {region === "All" ? "All regions" : region}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && <p className="places-status">Loading places...</p>}

      {error && (
        <div className="places-status places-error">
          {error}
          <button onClick={() => fetchPlaces()}>Retry</button>
        </div>
      )}

      {!loading && !error && filteredPlaces.length === 0 && (
        <p className="places-status">No places found</p>
      )}

      {!loading && !error && filteredPlaces.length > 0 && (
        <div className="places-grid">
          {filteredPlaces.map((place) => {
            const location = [place.district, place.region]
              .filter(Boolean)
              .join(", ");
            const info = tourInfo(place);

            return (
              <article className="place-card" key={place._id}>
                <div className="place-media">
                  {place.image && <img src={place.image} alt={place.name} />}
                  {place.region && (
                    <span className="place-type">{place.region}</span>
                  )}
                </div>

                <div className="place-body">
                  <h3>{place.name}</h3>
                  {location && <p className="place-region">📍 {location}</p>}

                  {place.description && (
                    <p className="place-description">{place.description}</p>
                  )}

                  {info && (
                    <div className="place-footer">
                      <span className="place-price-label">
                        {info.count} {info.count === 1 ? "tour" : "tours"} from
                      </span>
                      <strong className="place-price">${info.from}</strong>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default Places;