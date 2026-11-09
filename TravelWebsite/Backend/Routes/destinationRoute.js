const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

console.log("destinationRoute.js loaded");

// ===============================
// Destination Schema
// ===============================
const destinationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    district: {
      type: String,
      trim: true,
      default: "",
    },

    region: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
      trim: true,
      default: "",
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Destination =
  mongoose.models.Destination ||
  mongoose.model("Destination", destinationSchema);

// ===============================
// TEST ROUTE
// ===============================
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Destination route is working",
  });
});

// ===============================
// GET ALL DESTINATIONS
// ===============================
router.get("/", async (req, res) => {
  try {
    const destinations = await Destination.find().sort({
      createdAt: -1,
    });

    res.status(200).json(destinations);
  } catch (error) {
    console.error("GET destinations error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
});

// ===============================
// GET ONE DESTINATION
// ===============================
router.get("/:id", async (req, res) => {
  try {
    const destination = await Destination.findById(req.params.id);

    if (!destination) {
      return res.status(404).json({
        message: "Destination not found",
      });
    }

    res.status(200).json(destination);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

// ===============================
// CREATE DESTINATION
// ===============================
router.post("/", async (req, res) => {
  try {
    console.log("POST /api/destinations");
    console.log("Request body:", req.body);

    const {
      name,
      district,
      region,
      image,
      description,
    } = req.body;

    if (!name || !region) {
      return res.status(400).json({
        message: "Name and region are required",
      });
    }

    const destination = await Destination.create({
      name: name.trim(),
      district: district ? district.trim() : "",
      region: region.trim(),
      image: image ? image.trim() : "",
      description: description ? description.trim() : "",
    });

    console.log("Destination created:", destination._id);

    res.status(201).json(destination);
  } catch (error) {
    console.error("POST destination error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
});

// ===============================
// DELETE DESTINATION
// ===============================
router.delete("/:id", async (req, res) => {
  try {
    const destination = await Destination.findByIdAndDelete(
      req.params.id
    );

    if (!destination) {
      return res.status(404).json({
        message: "Destination not found",
      });
    }

    res.status(200).json({
      message: "Destination deleted successfully",
    });
  } catch (error) {
    console.error("DELETE destination error:", error);

    res.status(400).json({
      message: error.message,
    });
  }
});

module.exports = router;