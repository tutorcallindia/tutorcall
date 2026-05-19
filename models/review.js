const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  tutorId: { type: mongoose.Schema.Types.ObjectId, ref: "Tutor", required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  rating: { type: Number, required: true },
  reviewText: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports =

mongoose.models.Review ||

mongoose.model(
  "Review",
  reviewSchema
);
