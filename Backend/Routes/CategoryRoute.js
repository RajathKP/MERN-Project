// routes/categoryRoutes.js
// Needs:  npm install multer
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const Category = require("../Models/Category");
const Destination = require("../Models/Destination"); // adjust if your path differs

const router = express.Router();

// ---- image upload (optional field named "image") ----
const uploadDir = path.join(__dirname, "..", "uploads", "categories");
fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) =>
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${path.extname(file.originalname)}`),
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) =>
    file.mimetype.startsWith("image/")
      ? cb(null, true)
      : cb(new Error("Only image files are allowed")),
});

// GET /api/categories
router.get("/", async (req, res) => {
  try {
    res.json(await Category.find().sort({ name: 1 }));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/categories  (multipart/form-data: name, image?)
router.post("/", (req, res) => {
  upload.single("image")(req, res, async (uploadErr) => {
    if (uploadErr) return res.status(400).json({ message: uploadErr.message });

    try {
      const name = (req.body.name || "").trim();
      if (!name) return res.status(400).json({ message: "Category name is required" });

      const category = await Category.create({
        name,
        image: req.file ? `/uploads/categories/${req.file.filename}` : "",
      });
      res.status(201).json(category);
    } catch (err) {
      const message =
        err.code === 11000 ? "A category with this name already exists" : err.message;
      res.status(400).json({ message });
    }
  });
});

// DELETE /api/categories/:id
router.delete("/:id", async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found" });

    // leave destinations uncategorised instead of pointing at a missing id
    await Destination.updateMany({ category: category._id }, { $unset: { category: 1 } });

    if (category.image) {
      fs.unlink(path.join(__dirname, "..", category.image), () => {});
    }
    res.json({ message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;