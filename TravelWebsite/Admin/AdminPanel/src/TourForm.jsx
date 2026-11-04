import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "./AdminDashboard.css";
import "./TourForm.css";


const API = "http://localhost:5000/api/tours";

const emptyForm = {
  title: "",
  city: "",
  district: "",
  region: "",
  type: "",
  days: "",
  price: "",
  rating: "",
  image: "",
  description: "",
};

const AdminDashboard = () => {
  // The URL decides what is shown:
  //   ?tab=dashboard | ?tab=tours | ?tab=add | ?tab=add&edit=<tourId>
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab = ["dashboard", "tours", "add"].includes(tabParam)
    ? tabParam
    : "dashboard";
  const editingId = searchParams.get("edit"); // null when adding a new tour

  const [tours, setTours] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ADD / EDIT TOUR FORM (same page, same form)
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const isEditing = Boolean(editingId);

  // FETCH TOURS
  const fetchTours = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API);

      if (!response.ok) {
        throw new Error("Unable to fetch tours");
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Invalid response from backend");
      }

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

  // Adding (no ?edit param): make sure the form starts blank
  useEffect(() => {
    if (!editingId) {
      setForm(emptyForm);
      setFormError("");
    }
  }, [activeTab, editingId]);

  // Editing (?edit=<id>): pre-fill the form once the tour is available
  useEffect(() => {
    if (!editingId) return;
    const tour = tours.find((t) => t._id === editingId);
    if (!tour) return;

    setForm({
      title: tour.title || "",
      city: tour.city || "", 
      region: tour.region || "",
      type: tour.type || "",
      district: tour.district || "",
      days: tour.days ?? "",
      price: tour.price ?? "",
      rating: tour.rating ?? "",
      image: tour.image || "",   
      description: tour.description || "", 
    });
  }, [editingId, tours]);

  // SEARCH TOURS
  


  const filteredTours = tours.filter((tour) =>
  `${tour.title || ""} ${tour.city || ""} ${tour.district || ""} ${
    tour.region || ""
  } ${tour.type || ""}`
    .toLowerCase()
    .includes(search.toLowerCase())
);

  // FORM HELPERS
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setFormError("");
  };

  // Add tour -> ?tab=add
  const openAddForm = () => {
    resetForm();
    setSearch("");
    setSearchParams({ tab: "add" });
  };

  // Edit tour -> ?tab=add&edit=<id>
  const openEditForm = (tour) => {
    setFormError("");
    setSearch("");
    setSearchParams({ tab: "add", edit: tour._id });
  };

  // ADD or UPDATE TOUR (stays inside the admin panel)
  const saveTour = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!form.title.trim() || !form.city.trim() || !form.district.trim() || !form.region.trim()) {
      setFormError("Title, city, district and region are required");
      return;
    }

    const payload = {
      title: form.title.trim(),
      city: form.city.trim(),
      region: form.region.trim(),
      district: form.district.trim(),
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

      // Refresh list so the change appears everywhere in the panel
      await fetchTours();

      const message = isEditing
        ? "Tour updated successfully"
        : "Tour added successfully";

      resetForm();
      setSearch("");
      setSearchParams({ tab: "tours" });
      setSuccessMessage(message);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // DELETE TOUR
  const deleteTour = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this tour?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(`${API}/${id}`, {
        method: "DELETE",
      });

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

  const switchTab = (e, tab) => {
    e.preventDefault();
    // leaving the form discards any half-finished edit
    resetForm();
    setSearchParams({ tab });
    setSearch("");
  };

  const pageTitle = {
    dashboard: "Dashboard",
    tours: "Tour Packages",
    add: isEditing ? "Edit Tour" : "Add Tour",
  }[activeTab];

  const pageSubtitle = {
    dashboard: "Manage your TravelU tours",
    tours: `${tours.length} packages available`,
    add: isEditing ? "Update this tour package" : "Create a new tour package",
  }[activeTab];

  // SHARED: loading / error blocks
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

          <a href="#destinations">Destinations</a>
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

          {activeTab !== "add" && (
            <button className="add-tour-btn" onClick={openAddForm}>
              + Add Tour
            </button>
          )}
        </div>

        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}

        {/* ================= DASHBOARD VIEW ================= */}
        {activeTab === "dashboard" && (
          <>
            {/* STATISTICS */}
            <div className="stats">
              <div className="stat-card">
                <h3>Total Tours</h3>
                <strong>{tours.length}</strong>
              </div>

              <div className="stat-card">
                <h3>Destinations</h3>
                <strong>
                  {new Set(tours.map((tour) => tour.city).filter(Boolean)).size}
                </strong>
              </div>

              <div className="stat-card">
                <h3>Regions</h3>
                <strong>
                  {
                    new Set(tours.map((tour) => tour.region).filter(Boolean))
                      .size
                  }
                </strong>
              </div>
            </div>

            {/* TOUR TABLE */}
            <div className="tour-section" id="tours-table">
              <div className="section-header">
                <div>
                  <h2>All Tours</h2>
                  <p>Manage your available travel packages</p>
                </div>

                <input
                  type="text"
                  placeholder="Search tours..."
                  className="search-box"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {statusBlocks}

              {!loading && !error && (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Image</th>
                        <th>Tour</th>
                        <th>City</th>
                        <th>District</th>
                        <th>Region</th>
                        <th>Type</th>
                        <th>Days</th>
                        <th>Price</th>
                        <th>Rating</th>
                        <th>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredTours.length === 0 ? (
                        <tr>
                          <td colSpan="9">No tours found</td>
                        </tr>
                      ) : (
                        filteredTours.map((tour) => (
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

                            <td>
                              <button
                                className="edit-btn"
                                onClick={() => openEditForm(tour)}
                              >
                                Edit
                              </button>


                            <button
                                className="view-btn"
                                onClick={() => openEditForm(tour)}
                              >
                                View
                              </button>
                              <button
                                className="delete-btn"
                                onClick={() => deleteTour(tour._id)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* ================= TOUR PACKAGES VIEW ================= */}
        {activeTab === "tours" && (
          <div className="tour-section">
            <div className="section-header">
              <div>
                <h2>Tour Packages</h2>
                <p>Browse and manage all travel packages</p>
              </div>

              <input
                type="text"
                placeholder="Search tours..."
                className="search-box"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {statusBlocks}

            {!loading && !error && filteredTours.length === 0 && (
              <p>No tours found</p>
            )}

            {!loading && !error && filteredTours.length > 0 && (
              <div className="packages-grid">
                {filteredTours.map((tour) => (
                  <div className="package-card" key={tour._id}>
                    <img src={tour.image} alt={tour.title} />

                    <div className="package-body">
                      <span className="type-badge">{tour.type}</span>

                      <h3>{tour.title}</h3>

                      <p className="package-location">
                        {tour.city}
                        {tour.city && tour.region ? ", " : ""}
                        {tour.region}
                      </p>

                      <div className="package-meta">
                        <span>{tour.days} days</span>
                        <span>⭐ {tour.rating}</span>
                        <strong>${tour.price}</strong>
                      </div>

                      <div className="package-buttons">
                        <button
                          className="edit-btn"
                          onClick={() => openEditForm(tour)}
                        >
                          Edit
                        </button>

                        <button
                          className="delete-btn"
                          onClick={() => deleteTour(tour._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= ADD / EDIT TOUR VIEW ================= */}
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
                  placeholder="e.g.Calicut"
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
                onClick={() => {
                  resetForm();
                  setSearchParams({ tab: "tours" });
                }}
              >
                Cancel
              </button>

              <button type="submit" className="save-btn" disabled={saving}>
                {saving
                  ? "Saving..."
                  : isEditing
                  ? "Update Tour"
                  : "Add Tour"}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;