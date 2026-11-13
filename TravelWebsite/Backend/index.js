require("dotenv").config();

const dns = require("node:dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const path = require("path");
const express = require("express");
const cors = require("cors");

const authRoutes = require("./Routes/authRoute");
const connectDB = require("./config/db");

const tourRoutes = require("./Routes/tourRoutes");
const bookingRoutes = require("./Routes/BookingRoute");
const destinationRoute = require("./Routes/destinationRoute");
const taxiBookingRoutes = require("./Routes/TaxiBooking");
const categoryRoute = require("./Routes/CategoryRoute");

const app = express();


// =====================================
// MIDDLEWARE
// =====================================

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
    ],
    credentials: true,
  })
);

app.use(express.json());

// =====================================
// STATIC UPLOADS
// =====================================

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

// =====================================
// HOME
// =====================================

app.get("/", (req, res) => {
  res.send("TravelU Backend API is running");
});

// =====================================
// SERVER TEST
// =====================================

app.get("/travelu-test-2026", (req, res) => {
  res.send("TRAVELU BACKEND 2026 - CORRECT SERVER");
});

app.get("/taxi-direct-test", (req, res) => {
  res.json({
    success: true,
    message: "THIS IS THE CORRECT TRAVELU SERVER",
  });
});

// =====================================
// AUTH ROUTES
// =====================================

app.use("/api/auth", authRoutes);

// =====================================
// API ROUTES
// =====================================

app.use("/api/tours", tourRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/destinations", destinationRoute);
app.use("/api/categories", categoryRoute);
app.use("/api/taxi-bookings", taxiBookingRoutes);

// =====================================
// ROUTE LOG
// =====================================

console.log("=================================");
console.log("TravelU API routes mounted");
console.log("=================================");
console.log("Auth:           /api/auth");
console.log("Tours:          /api/tours");
console.log("Bookings:       /api/bookings");
console.log("Destinations:   /api/destinations");
console.log("Categories:     /api/categories");
console.log("Taxi Bookings:  /api/taxi-bookings");
console.log("=================================");

// =====================================
// START SERVER
// =====================================

const startServer = async () => {
  try {
    await connectDB();

    app.listen(5000, () => {
      console.log("=================================");
      console.log("TravelU server running on port 5000");
      console.log("=================================");
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();