const express = require("express");
const Destination = require("../Models/Destination");

const router = express.Router();

console.log("destinationRoute.js loaded");

// =====================================================
// TEST ROUTE
// GET /api/destinations/test
// =====================================================
router.get("/test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Destination route is working",
  });
});

// =====================================================
// GET ALL DESTINATIONS
// GET /api/destinations
// =====================================================
router.get("/", async (req, res) => {
  try {
    const destinations = await Destination.find().sort({
      createdAt: -1,
    });

    res.status(200).json(destinations);
  } catch (error) {
    console.error("GET destinations error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// =====================================================
// GET ONE DESTINATION
// GET /api/destinations/:id
// =====================================================
router.get("/:id", async (req, res) => {
  try {
    const destination = await Destination.findById(req.params.id);

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: "Destination not found",
      });
    }

    res.status(200).json(destination);
  } catch (error) {
    console.error("GET destination error:", error);

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// =====================================================
// CREATE DESTINATION
// POST /api/destinations
// =====================================================
router.post("/", async (req, res) => {
  try {
    console.log("POST /api/destinations");
    console.log("Request body:", req.body);

    const {
      name,
      district,
      region,
      category,
      image,
      description,
    } = req.body;

    // Required fields
    if (!name || !name.trim() || !region || !region.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name and region are required",
      });
    }

    const destination = await Destination.create({
      name: name.trim(),
      district: district ? district.trim() : "",
      region: region.trim(),
      category: category ? category.trim() : "",
      image: image ? image.trim() : "",
      description: description ? description.trim() : "",
    });

    console.log("Destination created:", destination._id);

    res.status(201).json({
      success: true,
      message: "Destination created successfully",
      destination,
    });
  } catch (error) {
    console.error("POST destination error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// =====================================================
// UPDATE DESTINATION
// PUT /api/destinations/:id
// =====================================================
router.put("/:id", async (req, res) => {
  try {
    console.log("PUT /api/destinations/" + req.params.id);
    console.log("Request body:", req.body);

    const {
      name,
      district,
      region,
      category,
      image,
      description,
    } = req.body;

    // Required fields
    if (!name || !name.trim() || !region || !region.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name and region are required",
      });
    }

    const updated = await Destination.findByIdAndUpdate(
      req.params.id,
      {
        name: name.trim(),
        district: district ? district.trim() : "",
        region: region.trim(),
        category: category ? category.trim() : "",
        image: image ? image.trim() : "",
        description: description ? description.trim() : "",
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Destination not found",
      });
    }

    console.log("Destination updated:", updated._id);

    res.status(200).json({
      success: true,
      message: "Destination updated successfully",
      destination: updated,
    });
  } catch (error) {
    console.error("PUT destination error:", error);

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// =====================================================
// DELETE DESTINATION
// DELETE /api/destinations/:id
// =====================================================
router.delete("/:id", async (req, res) => {
  try {
    console.log("DELETE /api/destinations/" + req.params.id);

    const destination = await Destination.findByIdAndDelete(
      req.params.id
    );

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: "Destination not found",
      });
    }

    console.log("Destination deleted:", destination._id);

    res.status(200).json({
      success: true,
      message: "Destination deleted successfully",
    });
  } catch (error) {
    console.error("DELETE destination error:", error);

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;