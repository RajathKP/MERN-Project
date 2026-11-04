import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import "./AdminDashboard.css";
import "./TourForm.css";


const API = "http://localhost:5000/api/tours";

const TABS = ["dashboard", "tours", "destinations", "add", "view"];

const emptyForm = {
  title: "",
  city: "",
  region: "",
  type: "",
  days: "",
  price: "",
  rating: "",
  image: "",
  description: "",
};

const countUnique = (tours, key) =>
  new Set(tours.map((tour) => tour[key]).filter(Boolean)).size;

/* ---------- Reusable table (read-only, or with Edit/Delete) ---------- */
const ToursTable = ({ tours, onView, onEdit, onDelete }) => {
  const showActions = Boolean(onView || onEdit || onDelete);
  const columns = showActions ? 9 : 8;

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Image</th>
            <th>Tour</th>
            <th>City</th>
            <th>Region</th>
            <th>Type</th>
            <th>Days</th>
            <th>Price</th>
            <th>Rating</th>
            {showActions && <th>Actions</th>}
          </tr>
        </thead>

        <tbody>
          {tours.length === 0 ? (
            <tr>
              <td colSpan={columns}>No tours found</td>
            </tr>
          ) : (
            tours.map((tour) => (
              <tr key={tour._id}>
                <td>
                  <img
                    src={tour.image}
                    alt={tour.title}
                    className="tour-image"
                  />
                </td>
                <td>
                  <strong>{tour.title}</strong>
                </td>
                <td>{tour.city}</td>
                <td>{tour.region}</td>
                <td>
                  <span className="type-badge">{tour.type}</span>
                </td>
                <td>{tour.days}</td>
                <td>${tour.price}</td>
                <td>⭐ {tour.rating}</td>

                {showActions && (
                  <td className="package-buttons">
                    {onView && (
                      <button className="view-btn" onClick={() => onView(tour)}>
                        View
                      </button>
                    )}
                    {onEdit && (
                      <button
                        className="edit-btn"
                        onClick={() => onEdit(tour)}
                      >
                        Edit
                      </button>
                    )}
                    {onDelete && (
                      <button
                        className="delete-btn"
                        onClick={() => onDelete(tour._id)}
                      >
                        Delete
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

/* ---------- Section header with search box ---------- */
const SectionHeader = ({ title, subtitle, search, onSearch, placeholder }) => (
  <div className="section-header">
    <div>
      <h2>{title}</h2>
      <p>{subtitle}</p>
    </div>

    <input
      type="text"
      placeholder={placeholder}
      className="search-box"
      value={search}
      onChange={(e) => onSearch(e.target.value)}
    />
  </div>
);

const AdminDashboard = () => {
  // The URL decides what is shown:
  //   ?tab=dashboard | ?tab=tours | ?tab=destinations | ?tab=add | ?tab=add&edit=<id>
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab = TABS.includes(tabParam) ? tabParam : "dashboard";
  const editingId = searchParams.get("edit");
  const isEditing = Boolean(editingId);
  const viewingId = searchParams.get("id");

  const [tours, setTours] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  /* ---------- Data ---------- */
  const fetchTours = async () => {
    try {
      setLoading(true);
      setError("");

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

  useEffect(() => {
    fetchTours();
  }, []);

  // Adding: start with a blank form
  useEffect(() => {
    if (!editingId) {
      setForm(emptyForm);
      setFormError("");
    }
  }, [activeTab, editingId]);

  // Editing: pre-fill the form once the tour is available
  useEffect(() => {
    if (!editingId) return;
    const tour = tours.find((t) => t._id === editingId);
    if (!tour) return;

    setForm({
      title: tour.title || "",
      city: tour.city || "",
      region: tour.region || "",
      type: tour.type || "",
      days: tour.days ?? "",
      price: tour.price ?? "",
      rating: tour.rating ?? "",
      image: tour.image || "",
      description: tour.description || "",
    });
  }, [editingId, tours]);

  const filteredTours = tours.filter((tour) =>
    `${tour.title || ""} ${tour.city || ""} ${tour.region || ""} ${tour.type || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const viewedTour = tours.find((tour) => tour._id === viewingId);

  const destinationCount = countUnique(tours, "city");
  const regionCount = countUnique(tours, "region");

  /* ---------- Handlers ---------- */
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setFormError("");
  };

  const goToTab = (tab, extraParams = {}) => {
    resetForm();
    setSearch("");
    setSearchParams({ tab, ...extraParams });
  };

  const switchTab = (e, tab) => {
    e.preventDefault();
    goToTab(tab);
  };

  const openAddForm = () => goToTab("add");
  const openEditForm = (tour) => goToTab("add", { edit: tour._id });
  const viewTour = (tour) => goToTab("view", { id: tour._id });

  const saveTour = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!form.title.trim() || !form.city.trim() || !form.region.trim()) {
      setFormError("Title, city and region are required");
      return;
    }

    const payload = {
      title: form.title.trim(),
      city: form.city.trim(),
      region: form.region.trim(),
      type: form.type.trim(),
      image: form.image.trim(),
      description: form.description.trim(),
      days: Number(form.days) || 0,
      price: Number(form.price) || 0,
      rating: Number(form.rating) || 0,
    };

    try {
      setSaving(true);

      const response = await fetch(isEditing ? `${API}/${editingId}` : API, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `Failed to ${isEditing ? "update" : "add"} tour`
        );
      }

      await fetchTours();

      goToTab("tours");
      setSuccessMessage(
        isEditing ? "Tour updated successfully" : "Tour added successfully"
      );
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteTour = async (id) => {
    if (!window.confirm("Are you sure you want to delete this tour?")) return;

    try {
      const response = await fetch(`${API}/${id}`, { method: "DELETE" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete tour");
      }

      setTours((previous) => previous.filter((tour) => tour._id !== id));
      alert("Tour deleted successfully");
    } catch (err) {
      alert(err.message);
    }
  };

  /* ---------- Page text ---------- */
  const pageTitle = {
    dashboard: "Dashboard",
    tours: "Tour Packages",
    destinations: "Destinations",
    view: "Tour Details",
    add: isEditing ? "Edit Tour" : "Add Tour",
  }[activeTab];

  const pageSubtitle = {
    dashboard: "Manage your TravelU tours",
    tours: `${tours.length} packages available`,
    destinations: `${destinationCount} destinations available`,
    view: "Full information about this tour",
    add: isEditing ? "Update this tour package" : "Create a new tour package",
  }[activeTab];

  // Loading / error blocks shared by the list views
  const statusBlocks = (
    <>
      {loading && <p>Loading tours...</p>}

      {error && (
        <div className="error-message">
          {error}
          <button onClick={fetchTours}>Retry</button>
        </div>
      )}
    </>
  );

  const isReady = !loading && !error;

  return (
    <div className="admin-layout">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="logo">
          Travel<span>U</span>
        </div>

        <nav>
          <a
            href="#dashboard"
            className={activeTab === "dashboard" ? "active" : ""}
            onClick={(e) => switchTab(e, "dashboard")}
          >
            Dashboard
          </a>

          <a
            href="#tours"
            className={activeTab === "tours" ? "active" : ""}
            onClick={(e) => switchTab(e, "tours")}
          >
            Tour Packages
          </a>

          <a
            href="#destinations"
            className={activeTab === "destinations" ? "active" : ""}
            onClick={(e) => switchTab(e, "destinations")}
          >
            Destinations
          </a>

          <a href="#bookings">Bookings</a>
          <a href="#users">Users</a>
        </nav>

        <div className="sidebar-bottom">
          <a href="#settings">Settings</a>
          <a href="#logout">Logout</a>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="admin-main">
        <div className="topbar">
          <div>
            <h1>{pageTitle}</h1>
            <p>{pageSubtitle}</p>
          </div>

          {activeTab === "tours" && (
            <button className="add-tour-btn" onClick={openAddForm}>
              + Add Tour
            </button>
          )}
        </div>

        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}

        {/* ================= DASHBOARD ================= */}
        {activeTab === "dashboard" && (
          <>
            <div className="stats">
              <div className="stat-card">
                <h3>Total Tours</h3>
                <strong>{tours.length}</strong>
              </div>

              <div className="stat-card">
                <h3>Destinations</h3>
                <strong>{destinationCount}</strong>
              </div>

              <div className="stat-card">
                <h3>Regions</h3>
                <strong>{regionCount}</strong>
              </div>
            </div>

            <div className="tour-section" id="tours-table">
              <SectionHeader
                title="All Tours"
                subtitle="All available travel packages"
                search={search}
                onSearch={setSearch}
                placeholder="Search tours..."
              />

              {statusBlocks}
              {isReady && (
                <ToursTable tours={filteredTours} onView={viewTour} />
              )}
            </div>
          </>
        )}

        {/* ================= TOUR PACKAGES ================= */}
        {activeTab === "tours" && (
          <div className="tour-section">
            <SectionHeader
              title="Tour Packages"
              subtitle="Browse and manage all travel packages"
              search={search}
              onSearch={setSearch}
              placeholder="Search tours..."
            />

            {statusBlocks}
            {isReady && (
              <ToursTable
                tours={filteredTours}
                onView={viewTour}
                onEdit={openEditForm}
                onDelete={deleteTour}
              />
            )}
          </div>
        )}

        {/* ================= DESTINATIONS ================= */}
        {activeTab === "destinations" && (
          <div className="tour-section">
            <SectionHeader
              title="Destinations"
              subtitle="Browse all destinations"
              search={search}
              onSearch={setSearch}
              placeholder="Search destinations..."
            />

            {statusBlocks}

            {isReady && filteredTours.length === 0 && (
              <p>No destinations found</p>
            )}

            {isReady && filteredTours.length > 0 && (
              <div className="packages-grid">
                {filteredTours.map((tour) => (
                  <div className="package-card" key={tour._id}>
                    <img src={tour.image} alt={tour.title} />

                    <div className="package-body">
                      <h3>{tour.title}</h3>

                      <p className="package-location">
                        {[tour.city, tour.region].filter(Boolean).join(", ")}
                      </p>

                      <p>{tour.description}</p>

                      <div className="package-buttons">
                        <button
                          className="view-btn"
                          onClick={() => viewTour(tour)}
                        >
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= VIEW TOUR ================= */}
        {activeTab === "view" && (
          <div className="tour-section">
            {statusBlocks}

            {isReady && !viewedTour && (
              <>
                <p>Tour not found</p>
                <button
                  className="cancel-btn"
                  onClick={() => goToTab("tours")}
                >
                  Back to tours
                </button>
              </>
            )}

            {isReady && viewedTour && (
              <div className="tour-details">
                <img
                  src={viewedTour.image}
                  alt={viewedTour.title}
                  className="tour-details-image"
                />

                <div className="tour-details-body">
                  <span className="type-badge">{viewedTour.type}</span>
                  <h2>{viewedTour.title}</h2>

                  <p className="package-location">
                    {[viewedTour.city, viewedTour.region]
                      .filter(Boolean)
                      .join(", ")}
                  </p>

                  <div className="tour-details-meta">
                    <div>
                      <span>Duration</span>
                      <strong>{viewedTour.days} days</strong>
                    </div>
                    <div>
                      <span>Price</span>
                      <strong>${viewedTour.price}</strong>
                    </div>
                    <div>
                      <span>Rating</span>
                      <strong>⭐ {viewedTour.rating}</strong>
                    </div>
                  </div>

                  <h3>About this tour</h3>
                  <p>{viewedTour.description || "No description provided."}</p>

                  <div className="form-actions">
                    <button
                      className="cancel-btn"
                      onClick={() => goToTab("tours")}
                    >
                      Back
                    </button>
                    <button
                      className="edit-btn"
                      onClick={() => openEditForm(viewedTour)}
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= ADD / EDIT TOUR ================= */}
        {activeTab === "add" && (
          <form className="add-tour-form" onSubmit={saveTour}>
            {formError && <div className="error-message">{formError}</div>}

            <label>
              Title *
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleFormChange}
                placeholder="e.g. Magical Munnar Escape"
              />
            </label>

            <div className="form-row">
              <label>
                City *
                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleFormChange}
                  placeholder="e.g. Munnar"
                />
              </label>



               <label>
                District *
                <input
                  type="text"
                  name="district"
                  value={form.district}
                  onChange={handleFormChange}
                  placeholder="e.g. Calicut"
                />
              </label>





              <label>
                Region *
                <input
                  type="text"
                  name="region"
                  value={form.region}
                  onChange={handleFormChange}
                  placeholder="e.g. Kerala"
                />
              </label>
            </div>

            <div className="form-row">
              <label>
                Type
                <input
                  type="text"
                  name="type"
                  value={form.type}
                  onChange={handleFormChange}
                  placeholder="e.g. Adventure, Beach, Cultural"
                />
              </label>

              <label>
                Days
                <input
                  type="number"
                  min="1"
                  name="days"
                  value={form.days}
                  onChange={handleFormChange}
                />
              </label>
            </div>

            <div className="form-row">
              <label>
                Price ($)
                <input
                  type="number"
                  min="0"
                  name="price"
                  value={form.price}
                  onChange={handleFormChange}
                />
              </label>

              <label>
                Rating (0–5)
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  name="rating"
                  value={form.rating}
                  onChange={handleFormChange}
                />
              </label>
            </div>

            <label>
              Image URL
              <input
                type="text"
                name="image"
                value={form.image}
                onChange={handleFormChange}
                placeholder="https://..."
              />
            </label>

            {form.image && (
              <img src={form.image} alt="Preview" className="image-preview" />
            )}

            <label>
              Description
              <textarea
                name="description"
                rows="4"
                value={form.description}
                onChange={handleFormChange}
                placeholder="Short description of the tour"
              />
            </label>

            <div className="form-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => goToTab("tours")}
              >
                Cancel
              </button>

              <button type="submit" className="save-btn" disabled={saving}>
                {saving ? "Saving..." : isEditing ? "Update Tour" : "Add Tour"}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;