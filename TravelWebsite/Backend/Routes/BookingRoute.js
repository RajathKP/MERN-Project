// Express + Mongoose routes for /api/bookings
//
// Mount in your server file (next to the tours / destinations routes):
//   const bookingRoutes = require("./bookingRoutes");
//   app.use("/api/bookings", bookingRoutes);
// Then restart the server.

const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

const bookingSchema = new mongoose.Schema(
  {
    tourId: { type: String, default: "" },
    tourTitle: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, trim: true, default: "" },
    travelDate: { type: Date },
    guests: { type: Number, default: 1, min: 1 },
    totalPrice: { type: Number, default: 0 },
    notes: { type: String, trim: true, default: "" },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Booking =
  mongoose.models.Booking || mongoose.model("Booking", bookingSchema);

// GET all bookings (newest first) -> used by the admin Bookings tab
router.get("/", async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new booking -> called when a customer books a tour
router.post("/", async (req, res) => {
  try {
    const {
      tourId,
      tourTitle,
      name,
      email,
      phone,
      travelDate,
      guests,
      totalPrice,
      notes,
    } = req.body;

    if (!tourTitle || !name || !email) {
      return res
        .status(400)
        .json({ message: "Tour, name and email are required" });
    }

    const booking = await Booking.create({
      tourId,
      tourTitle,
      name,
      email,
      phone,
      travelDate: travelDate || undefined,
      guests: Number(guests) || 1,
      totalPrice: Number(totalPrice) || 0,
      notes,
    });

    res.status(201).json(booking);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH a booking's status (pending / confirmed / cancelled)
router.patch("/:id", async (req, res) => {
  try {
    const { status } = req.body;

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json(booking);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE a booking
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Booking.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json({ message: "Booking deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;