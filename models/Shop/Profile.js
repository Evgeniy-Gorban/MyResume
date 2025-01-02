const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  img: { type: String, required: true },
  cart: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cart",
    required: false,
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

module.exports = mongoose.model("Profile", profileSchema);
