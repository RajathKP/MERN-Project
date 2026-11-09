import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";




const initialForm = {
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

    if (!form.title.trim() || !form.city.trim() || !form.district.trim() || !form.region.trim()) {
      setError("Title, city, district and region are required");
      return;
    }

    const payload = {
      ...form,
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
      placeholder="e.g. Idukki"
    />
  </label>
</div>

<div className="form-row">
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
</div>
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