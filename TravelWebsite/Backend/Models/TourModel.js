
const mongoose = require("mongoose");

const tourSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    city: {
      type: String,
      required: true,
      trim: true
    },

    region: {
      type: String,
      required: true,
      trim: true
    },

    type: {
      type: String,
      required: true,
      trim: true
    },

    days: {
      type: Number,
      required: true,
      min: 1
    },

    price: {
      type: Number,
      required: true,
      min: 0
    },

    // Original/discounted price
    was: {
      type: Number,
      default: 0
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },

    reviews: {
      type: Number,
      default: 0
    },

    image: {
      type: String,
      required: true
    },

    scene: {
      type: String,
      default: ""
    },

    description: {
      type: String,
      default: ""
    },

    months: {
      type: [String],
      default: []
    },

    country: {
      type: String,
      default: ""
    },

    district: {
      type: String,
      default: ""
    },

    month: {
      type: String,
      default: ""
    },

    duration: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Tour", tourSchema);
