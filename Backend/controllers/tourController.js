const Tour = require("../models/TourModel");

// GET ALL TOURS + SEARCH
exports.getTours = async (req, res) => {
  try {
    const { q } = req.query;

    let filter = {};

    if (q) {
      filter = {
        $or: [
          { title: { $regex: q, $options: "i" } },
          { city: { $regex: q, $options: "i" } },
          { region: { $regex: q, $options: "i" } },
          { type: { $regex: q, $options: "i" } }
        ]
      };
    }

    const tours = await Tour.find(filter).sort({
      createdAt: -1
    });

    res.status(200).json(tours);

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch tours",
      error: error.message
    });
  }
};


// GET SINGLE TOUR
exports.getTourById = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);

    if (!tour) {
      return res.status(404).json({
        message: "Tour not found"
      });
    }

    res.status(200).json(tour);

  } catch (error) {
    res.status(400).json({
      message: "Invalid tour ID",
      error: error.message
    });
  }
};


// ADD NEW TOUR
exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      message: "Tour added successfully",
      tour: newTour
    });

  } catch (error) {
    res.status(400).json({
      message: "Failed to add tour",
      error: error.message
    });
  }
};


// UPDATE TOUR
exports.updateTour = async (req, res) => {
  try {
    const updatedTour = await Tour.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!updatedTour) {
      return res.status(404).json({
        message: "Tour not found"
      });
    }

    res.status(200).json({
      message: "Tour updated successfully",
      tour: updatedTour
    });

  } catch (error) {
    res.status(400).json({
      message: "Failed to update tour",
      error: error.message
    });
  }
};


// DELETE TOUR
exports.deleteTour = async (req, res) => {
  try {
    const deletedTour = await Tour.findByIdAndDelete(
      req.params.id
    );

    if (!deletedTour) {
      return res.status(404).json({
        message: "Tour not found"
      });
    }

    res.status(200).json({
      message: "Tour deleted successfully"
    });

  } catch (error) {
    res.status(400).json({
      message: "Failed to delete tour",
      error: error.message
    });
  }
};