import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import Header from "./Header.jsx";
import Footer from "./Footer.jsx";
import { createTaxiBooking } from "../taxiApi.js";

import "./TaxiBooking.css";

const VEHICLES = ["Hatchback", "Sedan", "SUV", "Tempo Traveller"];

const emptyForm = {
  name: "",
  phone: "",
  email: "",
  pickupLocation: "",
  dropLocation: "",
  tripType: "one-way",
  pickupDate: "",
  pickupTime: "",
  vehicleType: "Sedan",
  passengers: 1,
  notes: "",
};

const TaxiBooking = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [booked, setBooked] = useState(null);

  const today = new Date().toISOString().slice(0, 10);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !form.name.trim() ||
      !form.phone.trim() ||
      !form.pickupLocation.trim() ||
      !form.dropLocation.trim()
    ) {
      setError("Name, phone, pickup and drop locations are required");
      return;
    }

    if (!form.pickupDate || !form.pickupTime) {
      setError("Please choose a pickup date and time");
      return;
    }

    try {
      setSubmitting(true);

      const booking = await createTaxiBooking({
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        pickupLocation: form.pickupLocation.trim(),
        dropLocation: form.dropLocation.trim(),
        tripType: form.tripType,
        pickupDate: form.pickupDate,
        pickupTime: form.pickupTime,
        vehicleType: form.vehicleType,
        passengers: Number(form.passengers) || 1,
        notes: form.notes.trim(),
      });

      setBooked(booking);
      setForm(emptyForm);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header onSignIn={() => navigate("/login")} />

      <div className="taxi-page">
        <div className="taxi-card">
          <h1>Book a Taxi</h1>
          <p className="taxi-sub">
            Tell us where you want to go and we'll confirm your ride shortly.
          </p>

          {booked ? (
            <div className="taxi-success">
              <h2>✅ Taxi request received</h2>
              <p>
                Thanks {booked.name}! We have your request for{" "}
                <strong>{booked.pickupLocation}</strong> →{" "}
                <strong>{booked.dropLocation}</strong>. Our team will call you
                on {booked.phone} to confirm.
              </p>

              <div className="taxi-actions">
                <button
                  className="taxi-btn"
                  onClick={() => setBooked(null)}
                >
                  Book another taxi
                </button>
                <button
                  className="taxi-btn taxi-btn-light"
                  onClick={() => navigate("/")}
                >
                  Back to home
                </button>
              </div>
            </div>
          ) : (
            <form className="taxi-form" onSubmit={handleSubmit}>
              {error && <div className="taxi-error">{error}</div>}

              <div className="taxi-row">
                <label>
                  Full name *
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your name"
                  />
                </label>

                <label>
                  Phone *
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="e.g. 98765 43210"
                  />
                </label>
              </div>

              <label>
                Email
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                />
              </label>

              <div className="taxi-row">
                <label>
                  Pickup location *
                  <input
                    type="text"
                    name="pickupLocation"
                    value={form.pickupLocation}
                    onChange={handleChange}
                    placeholder="e.g. Calicut Airport"
                  />
                </label>

                <label>
                  Drop location *
                  <input
                    type="text"
                    name="dropLocation"
                    value={form.dropLocation}
                    onChange={handleChange}
                    placeholder="e.g. Munnar"
                  />
                </label>
              </div>

              <div className="taxi-trip-type">
                <span>Trip type</span>

                <label>
                  <input
                    type="radio"
                    name="tripType"
                    value="one-way"
                    checked={form.tripType === "one-way"}
                    onChange={handleChange}
                  />
                  One way
                </label>

                <label>
                  <input
                    type="radio"
                    name="tripType"
                    value="round-trip"
                    checked={form.tripType === "round-trip"}
                    onChange={handleChange}
                  />
                  Round trip
                </label>
              </div>

              <div className="taxi-row">
                <label>
                  Pickup date *
                  <input
                    type="date"
                    name="pickupDate"
                    min={today}
                    value={form.pickupDate}
                    onChange={handleChange}
                  />
                </label>

                <label>
                  Pickup time *
                  <input
                    type="time"
                    name="pickupTime"
                    value={form.pickupTime}
                    onChange={handleChange}
                  />
                </label>
              </div>

              <div className="taxi-row">
                <label>
                  Vehicle
                  <select
                    name="vehicleType"
                    value={form.vehicleType}
                    onChange={handleChange}
                  >
                    {VEHICLES.map((vehicle) => (
                      <option key={vehicle} value={vehicle}>
                        {vehicle}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Passengers
                  <input
                    type="number"
                    min="1"
                    max="12"
                    name="passengers"
                    value={form.passengers}
                    onChange={handleChange}
                  />
                </label>
              </div>

              <label>
                Notes (optional)
                <textarea
                  name="notes"
                  rows="3"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Luggage, child seat, special requests..."
                />
              </label>

              <button
                type="submit"
                className="taxi-btn"
                disabled={submitting}
              >
                {submitting ? "Booking..." : "Book Taxi"}
              </button>
            </form>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default TaxiBooking;