
require("dotenv").config();

const dns = require("node:dns");

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const tourRoutes = require("./routes/tourRoutes");

const app = express();

// Allow both Travelu and Admin Panel
app.use(
  cors({
    origin: [
      "http://localhost:5173", // Travelu
      "http://localhost:5174", // Admin Panel
    ],
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("TravelU Backend API is running");
});

// Tour API
app.use("/api/tours", tourRoutes);

// Start server only after MongoDB connects
const startServer = async () => {
  try {
    await connectDB();

    app.listen(5000, () => {
      console.log("TravelU server running on port 5000");
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
