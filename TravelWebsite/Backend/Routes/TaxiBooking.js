const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

// Taxi Booking Schema
const taxiBookingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    pickup: {
      type: String,
      required: true,
      trim: true,
    },

    dropoff: {
      type: String,
      required: true,
      trim: true,
    },

    date: {
      type: String,
      required: true,
    },

    time: {
      type: String,
      required: true,
    },

    passengers: {
      type: Number,
      default: 1,
    },

    vehicle: {
      type: String,
      default: "",
    },

    message: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

const TaxiBooking =
  mongoose.models.TaxiBooking ||
  mongoose.model("TaxiBooking", taxiBookingSchema);


// ===============================
// GET ALL TAXI BOOKINGS
// ===============================
router.get("/", async (req, res) => {
  try {
    const bookings = await TaxiBooking.find().sort({
      createdAt: -1,
    });

    res.status(200).json(bookings);
  } catch (error) {
    console.error("GET taxi bookings error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


// ===============================
// GET SINGLE TAXI BOOKING
// ===============================
router.get("/:id", async (req, res) => {
  try {
    const booking = await TaxiBooking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Taxi booking not found",
      });
    }

    res.status(200).json(booking);
  } catch (error) {
    console.error("GET taxi booking error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


// ===============================
// CREATE TAXI BOOKING
// ===============================
router.post("/", async (req, res) => {
  try {
    const booking = new TaxiBooking(req.body);

    const savedBooking = await booking.save();

    res.status(201).json({
      success: true,
      message: "Taxi booking created successfully",
      booking: savedBooking,
    });
  } catch (error) {
    console.error("POST taxi booking error:", error);

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});


// ===============================
// UPDATE TAXI BOOKING
// ===============================
router.put("/:id", async (req, res) => {
  try {
    const booking = await TaxiBooking.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Taxi booking not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Taxi booking updated successfully",
      booking,
    });
  } catch (error) {
    console.error("PUT taxi booking error:", error);

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});


// ===============================
// DELETE TAXI BOOKING
// ===============================
router.delete("/:id", async (req, res) => {
  try {
    const booking = await TaxiBooking.findByIdAndDelete(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Taxi booking not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Taxi booking deleted successfully",
    });
  } catch (error) {
    console.error("DELETE taxi booking error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;