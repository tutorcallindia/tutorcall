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

  createdAt: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model(
  "StudentRequest",
  studentRequestSchema
);