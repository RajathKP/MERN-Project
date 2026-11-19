const mongoose = require("mongoose");
const Tour = require("./Models/TourModel");
const tours = require("./data");

console.log("Starting seed...");

mongoose
  .connect("mongodb+srv://rajathkp1_db_user:Mypass123@cluster0.q0gizfk.mongodb.net/travelu")
  .then(async () => {
    console.log("MongoDB connected");

    await Tour.deleteMany({});
    console.log("Old tours deleted");

    await Tour.insertMany(tours);
    console.log(`${tours.length} tours inserted successfully`);

    await mongoose.connection.close();
    console.log("MongoDB connection closed");
  })
  .catch((error) => {
    console.log("Seed error:", error.message);
  });