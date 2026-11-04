import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";


const API = "create new api for adding tour packages";

const initialForm = {
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

const Tourpackages = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.title.trim() || !form.city.trim() || !form.region.trim()) {
      setError("Title, city and region are required");
      return;
    }

    const payload = {
      ...form,
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
      setSubmitting(true);

      const response = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add tour");
      }

      alert("Tour added successfully");
      navigate("/admin");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="add-tour-page">
      <form className="add-tour-form" onSubmit={handleSubmit}>
        <div className="add-tour-header">
          <h1>Add Tour Package</h1>
          <p>Fill in the details to create a new TravelU tour</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <label>
          Title *
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
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
              onChange={handleChange}
              placeholder="e.g. Munnar"
            />
          </label>

          <label>
            Region *
            <input
              type="text"
              name="region"
              value={form.region}
              onChange={handleChange}
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
              onChange={handleChange}
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
              onChange={handleChange}
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
              onChange={handleChange}
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
              onChange={handleChange}
            />
          </label>
        </div>

        <label>
          Image URL
          <input
            type="text"
            name="image"
            value={form.image}
            onChange={handleChange}
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
            onChange={handleChange}
            placeholder="Short description of the tour"
          />
        </label>

        <div className="form-actions">
          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>

          <button type="submit" className="save-btn" disabled={submitting}>
            {submitting ? "Saving..." : "Add Tour"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Tourpackages;