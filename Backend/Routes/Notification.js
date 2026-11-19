// Routes/notifications.js  (mounted at /api/notifications in index.js)
// Self-contained: no separate model file or auth middleware needed.
//
// NOTE: notifications are looked up by the traveller's email. There is no login
// check here yet, so anyone who knows an email could read its notifications.
// Add your JWT middleware later to lock this down.

const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

// Same schema as in BookingRoute.js; the models.Notification guard prevents a duplicate model error.
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

// GET /api/notifications?email=traveller@example.com  -> latest 30
router.get("/", async (req, res) => {
  try {
    const email = (req.query.email || "").toLowerCase().trim();
    if (!email) return res.json([]);

    const list = await Notification.find({ email }).sort({ createdAt: -1 }).limit(30);
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/notifications/read   body: { email, ids: [...] }
router.patch("/read", async (req, res) => {
  try {
    const email = (req.body.email || "").toLowerCase().trim();
    const ids = Array.isArray(req.body.ids) ? req.body.ids : [];
    await Notification.updateMany({ _id: { $in: ids }, email }, { read: true });
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/notifications?email=...   -> clear all of this traveller's notifications
router.delete("/", async (req, res) => {
  try {
    const email = (req.query.email || "").toLowerCase().trim();
    if (!email) return res.status(400).json({ message: "email is required" });

    await Notification.deleteMany({ email });
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/notifications/:id?email=...   -> clear one notification
router.delete("/:id", async (req, res) => {
  try {
    const email = (req.query.email || "").toLowerCase().trim();
    if (!email) return res.status(400).json({ message: "email is required" });

    await Notification.deleteOne({ _id: req.params.id, email });
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;