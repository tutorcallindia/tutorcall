// server/models/Booking.js

const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(

  {

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true
    },

    tutorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tutor",
      required: true
    },

    subject: {
      type: String
    },

    mode: {
      type: String,
      default: ""
    },

    schedule: {
      type: String,
      default: ""
    },

    message: {
      type: String
    },

    amount: {
      type: Number,
      required: true
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "Accepted",
        "Rejected",
        "Completed",
        "Cancelled"
      ],
      default: "Pending"
    },

    demoDate: {
      type: Date,
      default: null
    }

  },

  {
    timestamps: true
  }

);

module.exports =

mongoose.models.Booking ||

mongoose.model(
  "Booking",
  bookingSchema
);