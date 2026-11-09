import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import "./AdminDashboard.css";
import "./TourForm.css";

const API = "http://localhost:5000/api/tours";
const DEST_API = "http://localhost:5000/api/destinations";
const TAXI_BOOKINGS_API = "http://localhost:5000/api/taxi-bookings";

const BOOKING_STATUSES = ["pending", "confirmed", "cancelled"];

const STATUS_COLORS = {
  pending: { background: "#fef3c7", color: "#92400e" },
  confirmed: { background: "#d1fae5", color: "#065f46" },
  cancelled: { background: "#fee2e2", color: "#991b1b" },
  completed: { background: "#dbeafe", color: "#1e40af" },
};

const TAXI_API = "http://localhost:5000/api/taxi-bookings";

const TAXI_STATUSES = ["pending", "confirmed", "completed", "cancelled"];

const TABS = [
  "dashboard",
  "tours",
  "destinations",
  "add",
  "add-destination",
  "bookings",
  "taxi",
  "view",
];

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
  // details-page fields
  oldPrice: "",
  hotelStars: "",
  incFlight: false,
  incTransfers: false,
  incMeals: false,
  incActivities: false,
  activities: "", // one per line
  inclusions: "", // one per line
  exclusions: "", // one per line
  itinerary: [], // [{ title, description }]
};

const emptyDestForm = {
  name: "",
  district: "",
  region: "",
  image: "",
  description: "",
};

// Safely read a response body. If the server sends HTML (e.g. an Express
// "Cannot POST /api/destinations" 404 page) instead of JSON, return a clear
// message instead of crashing with "Unexpected token '<'".
const parseResponse = async (response) => {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return {
      message: `Server returned an unexpected response (status ${response.status}). Make sure the API route exists and the backend was restarted.`,
    };
  }
};

// Turn a textarea (one item per line) into a clean array, and back
const splitLines = (text) =>
  String(text || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

const joinLines = (value) =>
  Array.isArray(value) ? value.join("\n") : value || "";

const countUnique = (tours, key) =>
  new Set(tours.map((tour) => tour[key]).filter(Boolean)).size;

/* ---------- Reusable table (read-only, or with View/Edit/Delete) ---------- */
const ToursTable = ({ tours, onView, onEdit, onDelete }) => {
  const showActions = Boolean(onView || onEdit || onDelete);
  const columns = showActions ? 9 : 8;

///










  ///
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

/* ---------- Destinations table (same look as the tours table) ---------- */
const DestinationsTable = ({ destinations, onDelete }) => (
  <div className="table-container">
    <table>
      <thead>
        <tr>
          <th>Image</th>
          <th>Destination</th>
          <th>District</th>
          <th>Region</th>
          <th>Description</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
        {destinations.length === 0 ? (
          <tr>
            <td colSpan="6">No destinations found</td>
          </tr>
        ) : (
          destinations.map((dest) => (
            <tr key={dest._id}>
              <td>
                {dest.image && (
                  <img
                    src={dest.image}
                    alt={dest.name}
                    className="tour-image"
                  />
                )}
              </td>
              <td>
                <strong>{dest.name}</strong>
              </td>
              <td>{dest.district}</td>
              <td>
                <span className="type-badge">{dest.region}</span>
              </td>
              <td
                style={{
                  maxWidth: "320px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                title={dest.description}
              >
                {dest.description}
              </td>
              <td className="package-buttons">
                <button
                  className="delete-btn"
                  onClick={() => onDelete(dest._id)}
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
);

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
  //   ?tab=dashboard | ?tab=tours | ?tab=destinations
  //   ?tab=add | ?tab=add&edit=<id>      (tour form)
  //   ?tab=add-destination               (destination form)
  //   ?tab=view&id=<id>                  (tour details)
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab = TABS.includes(tabParam) ? tabParam : "dashboard";
  const editingId = searchParams.get("edit");
  const isEditing = Boolean(editingId);
  const viewingId = searchParams.get("id");

  /* ---------- Tours state ---------- */
  const [tours, setTours] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  /* ---------- Destinations state ---------- */
  const [destinations, setDestinations] = useState([]);
  const [destLoading, setDestLoading] = useState(true);
  const [destError, setDestError] = useState("");

  const [destForm, setDestForm] = useState(emptyDestForm);
  const [destSaving, setDestSaving] = useState(false);
  const [destFormError, setDestFormError] = useState("");

  /* ---------- Bookings state ---------- */
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookingsError, setBookingsError] = useState("");

  /* ---------- Taxi bookings state ---------- */
  const [taxiBookings, setTaxiBookings] = useState([]);
  const [taxiLoading, setTaxiLoading] = useState(true);
  const [taxiError, setTaxiError] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  /* ---------- Data: tours ---------- */
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

  /* ---------- Data: destinations ---------- */
  const fetchDestinations = async () => {
    try {
      setDestLoading(true);
      setDestError("");

      const response = await fetch(DEST_API);
      if (!response.ok) throw new Error("Unable to fetch destinations");

      const data = await response.json();
      if (!Array.isArray(data)) throw new Error("Invalid response from backend");

      setDestinations(data);
    } catch (err) {
      setDestError(err.message);
    } finally {
      setDestLoading(false);
    }
  };

  /* ---------- Data: bookings ---------- */
  const fetchBookings = async () => {
    try {
      setBookingsLoading(true);
      setBookingsError("");

      const response = await fetch(BOOKINGS_API);
      if (!response.ok) throw new Error("Unable to fetch bookings");

      const data = await response.json();
      if (!Array.isArray(data)) throw new Error("Invalid response from backend");

      setBookings(data);
    } catch (err) {
      setBookingsError(err.message);
    } finally {
      setBookingsLoading(false);
    }
  };

  /* ---------- Data: taxi bookings ---------- */

  

const fetchTaxiBookings = async () => {
  try {
    setTaxiLoading(true);
    setTaxiError("");

    console.log("Fetching taxi bookings:", TAXI_BOOKINGS_API);

    const response = await fetch(TAXI_BOOKINGS_API);

    console.log("Taxi response status:", response.status);
    console.log("Taxi response URL:", response.url);

    const data = await parseResponse(response);

    console.log("Taxi bookings received:", data);

    if (!response.ok) {
      throw new Error(
        data.message ||
          `Server returned an unexpected response (status ${response.status})`
      );
    }

    if (!Array.isArray(data)) {
      throw new Error("Invalid response from backend");
    }

    setTaxiBookings(data);
  } catch (err) {
    console.error("Fetch taxi bookings error:", err);
    setTaxiError(err.message);
  } finally {
    setTaxiLoading(false);
  }
};



  useEffect(() => {
    fetchTours();
    fetchDestinations();
    fetchBookings();
    fetchTaxiBookings();
  }, []);

  // Adding a tour: start with a blank form
  useEffect(() => {
    if (!editingId) {
      setForm(emptyForm);
      setFormError("");
    }
  }, [activeTab, editingId]);

  // Editing a tour: pre-fill the form once the tour is available
  useEffect(() => {
    if (!editingId) return;
    const tour = tours.find((t) => t._id === editingId);
    if (!tour) return;

    setForm({
      title: tour.title || "",
      city: tour.city || "",
      district: tour.district || "",
      region: tour.region || "",
      type: tour.type || "",
      days: tour.days ?? "",
      price: tour.price ?? "",
      rating: tour.rating ?? "",
      image: tour.image || "",
      description: tour.description || "",
      oldPrice: tour.oldPrice ?? "",
      hotelStars: tour.hotelStars ?? "",
      incFlight: Boolean(tour.included?.flight),
      incTransfers: Boolean(tour.included?.transfers),
      incMeals: Boolean(tour.included?.meals),
      incActivities: Boolean(tour.included?.activities),
      activities: joinLines(tour.activities),
      inclusions: joinLines(tour.inclusions),
      exclusions: joinLines(tour.exclusions),
      itinerary: Array.isArray(tour.itinerary)
        ? tour.itinerary.map((d) => ({
            title: d.title || "",
            description: d.description || "",
          }))
        : [],
    });
  }, [editingId, tours]);

  const filteredTours = tours.filter((tour) =>
    `${tour.title || ""} ${tour.city || ""} ${tour.region || ""} ${tour.type || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const filteredDestinations = destinations.filter((dest) =>
    `${dest.name || ""} ${dest.district || ""} ${dest.region || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const filteredBookings = bookings.filter((booking) =>
    `${booking.name || ""} ${booking.email || ""} ${booking.phone || ""} ${
      booking.tourTitle || ""
    } ${booking.status || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

const filteredTaxiBookings = taxiBookings.filter((taxi) =>
  `${taxi.name || ""} ${taxi.email || ""} ${taxi.phone || ""} ${
    taxi.pickup || ""
  } ${taxi.dropoff || ""} ${taxi.vehicle || ""} ${taxi.status || ""}`
    .toLowerCase()
    .includes(search.toLowerCase())
);

  const viewedTour = tours.find((tour) => tour._id === viewingId);

  const regionCount = countUnique(tours, "region");

  /* ---------- Handlers ---------- */
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Itinerary rows (Day 1, Day 2, ...)
  const addItineraryDay = () =>
    setForm((previous) => ({
      ...previous,
      itinerary: [...previous.itinerary, { title: "", description: "" }],
    }));

  const updateItineraryDay = (index, field, value) =>
    setForm((previous) => ({
      ...previous,
      itinerary: previous.itinerary.map((day, i) =>
        i === index ? { ...day, [field]: value } : day
      ),
    }));

  const removeItineraryDay = (index) =>
    setForm((previous) => ({
      ...previous,
      itinerary: previous.itinerary.filter((_, i) => i !== index),
    }));

  const handleDestChange = (e) => {
    const { name, value } = e.target;
    setDestForm((previous) => ({ ...previous, [name]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setFormError("");
  };

  const resetDestForm = () => {
    setDestForm(emptyDestForm);
    setDestFormError("");
  };

  const goToTab = (tab, extraParams = {}) => {
    resetForm();
    resetDestForm();
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
  const openAddDestination = () => goToTab("add-destination");

  /* ---------- Save / delete: tours ---------- */
  const saveTour = async (e) => {
    e.preventDefault();
    setFormError("");

    if (
      !form.title.trim() ||
      !form.city.trim() ||
      !form.district.trim() ||
      !form.region.trim()
    ) {
      setFormError("Title, city, district and region are required");
      return;
    }

    const payload = {
      title: form.title.trim(),
      city: form.city.trim(),
      district: form.district.trim(),
      region: form.region.trim(),
      type: form.type.trim(),
      image: form.image.trim(),
      description: form.description.trim(),
      days: Number(form.days) || 0,
      price: Number(form.price) || 0,
      rating: Number(form.rating) || 0,
      oldPrice: Number(form.oldPrice) || 0,
      hotelStars: Number(form.hotelStars) || 0,
      included: {
        flight: form.incFlight,
        transfers: form.incTransfers,
        meals: form.incMeals,
        activities: form.incActivities,
      },
      activities: splitLines(form.activities),
      inclusions: splitLines(form.inclusions),
      exclusions: splitLines(form.exclusions),
      itinerary: form.itinerary
        .filter((day) => day.title.trim())
        .map((day) => ({
          title: day.title.trim(),
          description: day.description.trim(),
        })),
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
      showSuccess(
        isEditing ? "Tour updated successfully" : "Tour added successfully"
      );
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

  /* ---------- Save / delete: destinations ---------- */
  const saveDestination = async (e) => {
    e.preventDefault();
    setDestFormError("");

    if (!destForm.name.trim() || !destForm.region.trim()) {
      setDestFormError("Name and region are required");
      return;
    }

    const payload = {
      name: destForm.name.trim(),
      district: destForm.district.trim(),
      region: destForm.region.trim(),
      image: destForm.image.trim(),
      description: destForm.description.trim(),
    };

    try {
      setDestSaving(true);

      const response = await fetch(DEST_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await parseResponse(response);

      if (!response.ok) {
        throw new Error(data.message || "Failed to add destination");
      }

      await fetchDestinations();

      goToTab("destinations");
      showSuccess("Destination added successfully");
    } catch (err) {
      setDestFormError(err.message);
    } finally {
      setDestSaving(false);
    }
  };

  const deleteDestination = async (id) => {
    if (!window.confirm("Are you sure you want to delete this destination?"))
      return;

    try {
      const response = await fetch(`${DEST_API}/${id}`, { method: "DELETE" });
      const data = await parseResponse(response);

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete destination");
      }

      setDestinations((previous) => previous.filter((d) => d._id !== id));
      showSuccess("Destination deleted successfully");
    } catch (err) {
      alert(err.message);
    }
  };

  /* ---------- Update / delete: bookings ---------- */
  const updateBookingStatus = async (id, status) => {
    try {
      const response = await fetch(`${BOOKINGS_API}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const data = await parseResponse(response);

      if (!response.ok) {
        throw new Error(data.message || "Failed to update booking");
      }

      setBookings((previous) =>
        previous.map((b) => (b._id === id ? { ...b, status } : b))
      );
      showSuccess("Booking status updated");
    } catch (err) {
      alert(err.message);
    }
  };

  const deleteBooking = async (id) => {
    if (!window.confirm("Are you sure you want to delete this booking?"))
      return;

    try {
      const response = await fetch(`${BOOKINGS_API}/${id}`, {
        method: "DELETE",
      });
      const data = await parseResponse(response);

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete booking");
      }

      setBookings((previous) => previous.filter((b) => b._id !== id));
      showSuccess("Booking deleted successfully");
    } catch (err) {
      alert(err.message);
    }
  };

  /* ---------- Update / delete: taxi bookings ---------- */
  const updateTaxiStatus = async (id, status) => {
  try {
    const response = await fetch(`${TAXI_API}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    const data = await parseResponse(response);

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to update taxi booking"
      );
    }

    setTaxiBookings((previous) =>
      previous.map((t) =>
        t._id === id
          ? { ...t, status: data.booking?.status || status }
          : t
      )
    );

    showSuccess("Taxi booking status updated");
  } catch (err) {
    alert(err.message);
  }
};

  const deleteTaxiBooking = async (id) => {
    if (!window.confirm("Are you sure you want to delete this taxi booking?"))
      return;

    try {
      const response = await fetch(`${TAXI_API}/${id}`, { method: "DELETE" });
      const data = await parseResponse(response);

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete taxi booking");
      }

      setTaxiBookings((previous) => previous.filter((t) => t._id !== id));
      showSuccess("Taxi booking deleted successfully");
    } catch (err) {
      alert(err.message);
    }
  };

  /* ---------- Page text ---------- */
  const pageTitle = {
    dashboard: "Dashboard",
    tours: "Tour Packages",
    destinations: "Destinations",
    "add-destination": "Add Destination",
    bookings: "Bookings",
    taxi: "Taxi Bookings",
    view: "Tour Details",
    add: isEditing ? "Edit Tour" : "Add Tour",
  }[activeTab];

  const pageSubtitle = {
    dashboard: "Manage your TravelU tours",
    tours: `${tours.length} packages available`,
    destinations: `${destinations.length} destinations available`,
    "add-destination": "Create a new destination",
    bookings: `${bookings.length} bookings received`,
    taxi: `${taxiBookings.length} taxi bookings received`,
    view: "Full information about this tour",
    add: isEditing ? "Update this tour package" : "Create a new tour package",
  }[activeTab];

  // Loading / error blocks shared by the tour views
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

  // Loading / error blocks for the destinations view
  const destStatusBlocks = (
    <>
      {destLoading && <p>Loading destinations...</p>}

      {destError && (
        <div className="error-message">
          {destError}
          <button onClick={fetchDestinations}>Retry</button>
        </div>
      )}
    </>
  );

  const isReady = !loading && !error;
  const isDestReady = !destLoading && !destError;

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
            className={
              activeTab === "destinations" || activeTab === "add-destination"
                ? "active"
                : ""
            }
            onClick={(e) => switchTab(e, "destinations")}
          >
            Destinations
          </a>

          <a
            href="#bookings"
            className={activeTab === "bookings" ? "active" : ""}
            onClick={(e) => switchTab(e, "bookings")}
          >
            Bookings
          </a>
          <a
            href="#taxi"
            className={activeTab === "taxi" ? "active" : ""}
            onClick={(e) => switchTab(e, "taxi")}
          >
            Taxi Bookings
          </a>
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

          {activeTab === "destinations" && (
            <button className="add-tour-btn" onClick={openAddDestination}>
              + Add Destination
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
                <strong>{destinations.length}</strong>
              </div>

              <div className="stat-card">
                <h3>Regions</h3>
                <strong>{regionCount}</strong>
              </div>

              <div className="stat-card">
                <h3>Bookings</h3>
                <strong>{bookings.length}</strong>
              </div>

              <div className="stat-card">
                <h3>Taxi Bookings</h3>
                <strong>{taxiBookings.length}</strong>
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
              subtitle="Browse and manage all destinations"
              search={search}
              onSearch={setSearch}
              placeholder="Search destinations..."
            />

            {destStatusBlocks}

            {isDestReady && (
              <DestinationsTable
                destinations={filteredDestinations}
                onDelete={deleteDestination}
              />
            )}
          </div>
        )}

        {/* ================= ADD DESTINATION ================= */}
        {activeTab === "add-destination" && (
          <form className="add-tour-form" onSubmit={saveDestination}>
            {destFormError && (
              <div className="error-message">{destFormError}</div>
            )}

            <label>
              Destination name *
              <input
                type="text"
                name="name"
                value={destForm.name}
                onChange={handleDestChange}
                placeholder="e.g. Munnar"
              />
            </label>

            <div className="form-row">
              <label>
                District
                <input
                  type="text"
                  name="district"
                  value={destForm.district}
                  onChange={handleDestChange}
                  placeholder="e.g. Idukki"
                />
              </label>

              <label>
                Region *
                <input
                  type="text"
                  name="region"
                  value={destForm.region}
                  onChange={handleDestChange}
                  placeholder="e.g. Kerala"
                />
              </label>
            </div>

            <label>
              Image URL
              <input
                type="text"
                name="image"
                value={destForm.image}
                onChange={handleDestChange}
                placeholder="https://..."
              />
            </label>

            {destForm.image && (
              <img
                src={destForm.image}
                alt="Preview"
                className="image-preview"
              />
            )}

            <label>
              Description
              <textarea
                name="description"
                rows="4"
                value={destForm.description}
                onChange={handleDestChange}
                placeholder="Short description of the destination"
              />
            </label>

            <div className="form-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => goToTab("destinations")}
              >
                Cancel
              </button>

              <button type="submit" className="save-btn" disabled={destSaving}>
                {destSaving ? "Saving..." : "Add Destination"}
              </button>
            </div>
          </form>
        )}

        {/* ================= BOOKINGS ================= */}
        {activeTab === "bookings" && (
          <div className="tour-section">
            <SectionHeader
              title="Bookings"
              subtitle="Tours booked by customers"
              search={search}
              onSearch={setSearch}
              placeholder="Search bookings..."
            />

            {bookingsLoading && <p>Loading bookings...</p>}

            {bookingsError && (
              <div className="error-message">
                {bookingsError}
                <button onClick={fetchBookings}>Retry</button>
              </div>
            )}

            {!bookingsLoading && !bookingsError && (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Booked on</th>
                      <th>Customer</th>
                      <th>Tour</th>
                      <th>Travel date</th>
                      <th>Guests</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredBookings.length === 0 ? (
                      <tr>
                        <td colSpan="8">No bookings found</td>
                      </tr>
                    ) : (
                      filteredBookings.map((booking) => {
                        const status = booking.status || "pending";

                        return (
                          <tr key={booking._id}>
                            <td>
                              {booking.createdAt
                                ? new Date(booking.createdAt).toLocaleDateString()
                                : "-"}
                            </td>
                            <td>
                              <strong>{booking.name}</strong>
                              <br />
                              {booking.email}
                              {booking.phone && (
                                <>
                                  <br />
                                  {booking.phone}
                                </>
                              )}
                            </td>
                            <td>{booking.tourTitle}</td>
                            <td>
                              {booking.travelDate
                                ? new Date(
                                    booking.travelDate
                                  ).toLocaleDateString()
                                : "-"}
                            </td>
                            <td>{booking.guests}</td>
                            <td>${booking.totalPrice}</td>
                            <td>
                              <select
                                value={status}
                                onChange={(e) =>
                                  updateBookingStatus(
                                    booking._id,
                                    e.target.value
                                  )
                                }
                                style={{
                                  ...STATUS_COLORS[status],
                                  border: "none",
                                  borderRadius: "999px",
                                  padding: "0.3rem 0.7rem",
                                  fontWeight: 600,
                                  textTransform: "capitalize",
                                }}
                              >
                                {BOOKING_STATUSES.map((s) => (
                                  <option key={s} value={s}>
                                    {s}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="package-buttons">
                              <button
                                className="delete-btn"
                                onClick={() => deleteBooking(booking._id)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ================= TAXI BOOKINGS ================= */}
       {/* ================= TAXI BOOKINGS ================= */}
{activeTab === "taxi" && (
  <div className="tour-section">
    <SectionHeader
      title="Taxi Bookings"
      subtitle="Taxi rides booked by customers"
      search={search}
      onSearch={setSearch}
      placeholder="Search taxi bookings..."
    />

    {taxiLoading && <p>Loading taxi bookings...</p>}

    {taxiError && (
      <div className="error-message">
        {taxiError}
        <button onClick={fetchTaxiBookings}>Retry</button>
      </div>
    )}

    {!taxiLoading && !taxiError && (
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Booked on</th>
              <th>Customer</th>
              <th>Route</th>
              <th>Pickup Date & Time</th>
              <th>Vehicle</th>
              <th>Passengers</th>
              <th>Message</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredTaxiBookings.length === 0 ? (
              <tr>
                <td colSpan="9">No taxi bookings found</td>
              </tr>
            ) : (
              filteredTaxiBookings.map((taxi) => {
                const status = taxi.status || "Pending";

                return (
                  <tr key={taxi._id}>
                    {/* Booked on */}
                    <td>
                      {taxi.createdAt
                        ? new Date(taxi.createdAt).toLocaleDateString()
                        : "-"}
                    </td>

                    {/* Customer */}
                    <td>
                      <strong>{taxi.name || "-"}</strong>
                      <br />

                      {taxi.phone || "-"}
                      <br />

                      {taxi.email || "-"}
                    </td>

                    {/* Route */}
                    <td>
                      <strong>{taxi.pickup || "-"}</strong>
                      <br />
                      → {taxi.dropoff || "-"}
                    </td>

                    {/* Date & time */}
                    <td>
                      {taxi.date || "-"}
                      <br />
                      {taxi.time || "-"}
                    </td>

                    {/* Vehicle */}
                    <td>
                      <span className="type-badge">
                        {taxi.vehicle || "-"}
                      </span>
                    </td>

                    {/* Passengers */}
                    <td>{taxi.passengers || 1}</td>

                    {/* Message */}
                    <td>
                      {taxi.message ? taxi.message : "-"}
                    </td>

                    {/* Status */}
                    <td>
                      <select
                        value={status.toLowerCase()}
                        onChange={(e) =>
                          updateTaxiStatus(
                            taxi._id,
                            e.target.value
                          )
                        }
                        style={{
                          ...(STATUS_COLORS[
                            status.toLowerCase()
                          ] || STATUS_COLORS.pending),
                          border: "none",
                          borderRadius: "999px",
                          padding: "0.3rem 0.7rem",
                          fontWeight: 600,
                          textTransform: "capitalize",
                        }}
                      >
                        {TAXI_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="package-buttons">
                      <button
                        className="delete-btn"
                        onClick={() =>
                          deleteTaxiBooking(taxi._id)
                        }
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
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
                    {[viewedTour.city, viewedTour.district, viewedTour.region]
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
                District
                <input
                  type="text"
                  name="district"
                  value={form.district}
                  onChange={handleFormChange}
                  placeholder="e.g. Idukki"
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

            {/* ---------- Details page content ---------- */}
            <h3 style={{ margin: "1.5rem 0 0.5rem" }}>
              Details page (optional)
            </h3>

            <div className="form-row">
              <label>
                Original price ($) – shown struck through
                <input
                  type="number"
                  min="0"
                  name="oldPrice"
                  value={form.oldPrice}
                  onChange={handleFormChange}
                />
              </label>

              <label>
                Hotel stars (0 = none)
                <input
                  type="number"
                  min="0"
                  max="5"
                  name="hotelStars"
                  value={form.hotelStars}
                  onChange={handleFormChange}
                />
              </label>
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "1.2rem",
                margin: "0.5rem 0 1rem",
              }}
            >
              <label style={{ display: "flex", gap: "0.4rem" }}>
                <input
                  type="checkbox"
                  name="incFlight"
                  checked={form.incFlight}
                  onChange={handleFormChange}
                />
                Flight
              </label>
              <label style={{ display: "flex", gap: "0.4rem" }}>
                <input
                  type="checkbox"
                  name="incTransfers"
                  checked={form.incTransfers}
                  onChange={handleFormChange}
                />
                Transfers
              </label>
              <label style={{ display: "flex", gap: "0.4rem" }}>
                <input
                  type="checkbox"
                  name="incMeals"
                  checked={form.incMeals}
                  onChange={handleFormChange}
                />
                Meals
              </label>
              <label style={{ display: "flex", gap: "0.4rem" }}>
                <input
                  type="checkbox"
                  name="incActivities"
                  checked={form.incActivities}
                  onChange={handleFormChange}
                />
                Activities
              </label>
            </div>

            <label>
              Activities (one per line)
              <textarea
                name="activities"
                rows="3"
                value={form.activities}
                onChange={handleFormChange}
                placeholder={"Watersports\nKintamani Tour"}
              />
            </label>

            <label>
              Inclusions (one per line)
              <textarea
                name="inclusions"
                rows="4"
                value={form.inclusions}
                onChange={handleFormChange}
                placeholder={"6 nights accommodation\nDaily breakfast"}
              />
            </label>

            <label>
              Exclusions (one per line)
              <textarea
                name="exclusions"
                rows="4"
                value={form.exclusions}
                onChange={handleFormChange}
                placeholder={"Airfare\nPersonal expenses"}
              />
            </label>

            <h3 style={{ margin: "1.5rem 0 0.5rem" }}>Itinerary</h3>

            {form.itinerary.map((day, index) => (
              <div
                key={index}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "10px",
                  padding: "0.9rem",
                  marginBottom: "0.8rem",
                }}
              >
                <label>
                  Day {index + 1} title
                  <input
                    type="text"
                    value={day.title}
                    onChange={(e) =>
                      updateItineraryDay(index, "title", e.target.value)
                    }
                    placeholder="e.g. Arrival"
                  />
                </label>

                <label>
                  Details
                  <textarea
                    rows="3"
                    value={day.description}
                    onChange={(e) =>
                      updateItineraryDay(index, "description", e.target.value)
                    }
                    placeholder="What happens on this day"
                  />
                </label>

                <button
                  type="button"
                  className="delete-btn"
                  onClick={() => removeItineraryDay(index)}
                >
                  Remove day
                </button>
              </div>
            ))}

            <button
              type="button"
              className="view-btn"
              onClick={addItineraryDay}
              style={{ marginBottom: "1rem" }}
            >
              + Add day
            </button>

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