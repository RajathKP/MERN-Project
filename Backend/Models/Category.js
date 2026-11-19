// models/Category.js
const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    image: { type: String, default: "" }, // e.g. "/uploads/categories/123.jpg"
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);