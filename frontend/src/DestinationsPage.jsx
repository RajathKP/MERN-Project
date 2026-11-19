import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import Scene from "./components/Scene.jsx";
import { SectionTitle } from "./components/common.jsx";
import "./DestinationsPage.css";

const API = "http://localhost:6001/api/tours";

const nameOf = t => t.city || t.name || t.title || "";

export default function DestinationsPage() {
  const navigate = useNavigate();

  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [region, setRegion] = useState("");
  const [query, setQuery] = useState("");

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
        setTours(Array.isArray(data) ? data : data.tours || []);
      } catch (err) {
        console.error("Failed to fetch tours:", err);
        setError("Unable to load destinations. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchTours();
  }, []);

  // One entry per destination (unique name within a region)
  const destinations = useMemo(() => {
    const map = new Map();

    tours.forEach(t => {
      const name = nameOf(t);
      if (!name) return;

      const key = `${t.region || ""}|${name.toLowerCase()}`;

      if (!map.has(key)) {
        map.set(key, {
          key,
          name,
          region: t.region || "",
          sub: t.sub || t.description || "",
          scene: t.scene || "paris",
          image: t.image,
          tours: 0
        });
      }

      map.get(key).tours += 1;
    });

    return Array.from(map.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [tours]);

  const regions = useMemo(
    () =>
      Array.from(
        new Set(destinations.map(d => d.region).filter(Boolean))
      ).sort(),
    [destinations]
  );

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();

    return destinations.filter(
      d =>
        (!region || d.region === region) &&
        (!q ||
          d.name.toLowerCase().includes(q) ||
          d.region.toLowerCase().includes(q))
    );
  }, [destinations, region, query]);

  const open = d => {
    navigate(
      d.region ? `/?region=${encodeURIComponent(d.region)}` : "/"
    );
  };

  return (
    <>
      <Header onSignIn={() => navigate("/login")} />

      <main className="dest-page">
        <section className="section dark dest-top">
          <div className="wrap">
            <SectionTitle
              light
              title="All Destinations"
              sub="Every destination we travel to. Pick one to see its tours."
            />

            {loading && <p className="loading">Loading destinations...</p>}
            {error && <p className="error">{error}</p>}

            {!loading && !error && (
              <>
                <div className="dest-controls">
                  <input
                    type="search"
                    placeholder="Search destinations..."
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    aria-label="Search destinations"
                  />
                </div>

                <div className="tabs" role="tablist">
                  <button
                    role="tab"
                    aria-selected={region === ""}
                    className={region === "" ? "on" : ""}
                    onClick={() => setRegion("")}
                  >
                    All
                  </button>

                  {regions.map(r => (
                    <button
                      key={r}
                      role="tab"
                      aria-selected={region === r}
                      className={region === r ? "on" : ""}
                      onClick={() => setRegion(r)}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>

        {!loading && !error && (
          <section className="section dest-list">
            <div className="wrap">
              <p className="dest-count">
                {list.length} destination{list.length !== 1 && "s"}
              </p>

              {list.length === 0 && (
                <p className="dest-empty">No destinations found.</p>
              )}

              <div className="dest-grid">
                {list.map(d => (
                  <a
                    key={d.key}
                    className="dcard"
                    href={`/?region=${encodeURIComponent(d.region)}`}
                    onClick={e => {
                      e.preventDefault();
                      open(d);
                    }}
                  >
                    <Scene
                      kind={d.scene}
                      image={d.image}
                      alt={d.name}
                    />

                    <div className="dcard-cap">
                      <b>{d.name}</b>
                      <b>{d.district}</b>
                      <span>{d.sub}</span>

                      <em className="dest-badge">
                        {d.region}
                        {}
                        {d.tours > 1 && ` · ${d.tours} tours`}
                      </em>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}
