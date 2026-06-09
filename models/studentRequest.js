const mongoose = require("mongoose");

const studentRequestSchema = new mongoose.Schema({

  name: String,

  father: String,

  age: Number,

  dob: String,

  school: String,

  className: String,

  district: String,

  state: String,

  address: String,

  email: String,

  gps: String,

  assignedTutor: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Tutor"
},

  createdAt: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model(
  "StudentRequest",
  studentRequestSchema
);