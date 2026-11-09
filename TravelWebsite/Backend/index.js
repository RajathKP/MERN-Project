require("dotenv").config();

const dns = require("node:dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const express = require("express");
const cors = require("cors");
const bookingRoutes = require("./Routes/BookingRoute");
const connectDB = require("./config/db");
const taxiBookingRoutes = require("./Routes/TaxiBooking");
const tourRoutes = require("./routes/tourRoutes");
const destinationRoute = require("./Routes/destinationRoute");


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
  })
);

app.use(express.json());


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


// =====================================
// API ROUTES
// =====================================

app.use("/api/tours", tourRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/destinations", destinationRoute);
app.use("/api/taxi-bookings", taxiBookingRoutes);

// =====================================
// LOG
// =====================================

console.log("Destination route mounted at /api/destinations");


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
      console.log("Tours:        /api/tours");
      console.log("Bookings:     /api/bookings");
      console.log("Destinations: /api/destinations");
    });

  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();