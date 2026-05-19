const mongoose = require("mongoose");

const tutorSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true,
    trim: true
  },

  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  password: {
    type: String,
    required: true
  },

  city: {
    type: String,
    default: ""
  },
  address: {
  type: String,
  default: ""
},

latitude: {
  type: Number,
  default: 0
},

longitude: {
  type: Number,
  default: 0
},

  qualification: {
    type: String,
    default: ""
  },

  experience: {
    type: String,
    default: ""
  },

  classes: {
    type: String,
    default: ""
  },

  subjects: {
    type: String,
    default: ""
  },

 mode: {
  type: String,
  enum: [
    "Online Tuition",
    "Home Tuition",
    "Both"
  ]
},

fees: {
  type: Number,
  default: 0
},
  bio: {
    type: String,
    default: ""
  },

  photo: {
    type: String,
    default: ""
  },

  rating: {
    type: Number,
    default: 0
  },

  totalStudents: {
    type: Number,
    default: 0
  },

  isApproved: {
    type: Boolean,
    default: false
  },

  isBlocked: {
    type: Boolean,
    default: false
  }

}, {
  timestamps: true
});

module.exports = mongoose.model(
  "Tutor",
  tutorSchema
);