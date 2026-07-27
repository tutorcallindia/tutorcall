const mongoose =
  require("mongoose");

const userSchema =
  new mongoose.Schema({

  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    unique: true,
    required: true
  },

  subscriptionType: {

    type: String,

    enum: [

      "FREE",

      "LOCAL_PREMIUM",

      "FOREIGN_PREMIUM"
    ],

    default: "FREE"
  },

  subscriptionExpiresAt: {

    type: Date,

    default: null
  },

  totalWalletMinutes: {

    type: Number,

    default: 60
  },

  oneTimeTokens: {

    type: Number,

    default: 0
  }

},

{
  timestamps: true
});

module.exports =
  mongoose.model(
    "User",
    userSchema
  );