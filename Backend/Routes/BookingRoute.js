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

// ----- Notification (same collection used by Routes/notifications.js) -----
const Notification =
  mongoose.models.Notification ||
  mongoose.model(
    "Notification",
    new mongoose.Schema(
      {
        email: { type: String, required: true, lowercase: true, trim: true, index: true },
        booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
        title: { type: String, required: true },
        message: { type: String, required: true },
        tone: { type: String, enum: ["good", "warn", "neutral"], default: "neutral" },
        read: { type: Boolean, default: false },
      },
      { timestamps: true }
    )
  );

const STATUS_COPY = {
  confirmed: { title: "Booking confirmed", tone: "good", text: "is confirmed. Get ready to travel!" },
  cancelled: { title: "Booking cancelled", tone: "warn", text: "has been cancelled." },
  pending: { title: "Booking pending", tone: "neutral", text: "is now pending review." },
};

// Creates a notification for the traveller when the admin changes a booking's status.
async function notifyBookingStatus(booking, oldStatus) {
  if (!booking || booking.status === oldStatus) return;

  const copy = STATUS_COPY[booking.status] || {
    title: "Booking updated",
    tone: "neutral",
    text: `status changed to ${booking.status}.`,
  };

  await Notification.create({
    email: booking.email,
    booking: booking._id,
    title: copy.title,
    message: `${booking.tourTitle} ${copy.text}`,
    tone: copy.tone,
  });
}

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

    const existing = await Booking.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: "Booking not found" });
    }
    const oldStatus = existing.status;

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    // notify the traveller; a notification failure must not break the admin's save
    try {
      await notifyBookingStatus(booking, oldStatus);
    } catch (e) {
      console.error("Notification failed:", e.message);
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