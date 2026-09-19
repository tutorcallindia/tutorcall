const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true,
    trim: true
  },

  phone: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },

  password: {
    type: String,
    required: true
  },

  date: {
    type: Date,
    default: Date.now
  },

  isBlocked: {
    type: Boolean,
    default: false
  }

});

module.exports = mongoose.model("Student", studentSchema);