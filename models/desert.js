const mongoose = require("mongoose");

const desertSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  currency: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  image: {
    type: String,
    default:
      "https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  },
  currency: {
    type: String,
  },
  max: {
    type: Number,
    default: 1,
  },
});

module.exports = mongoose.model("Desert", desertSchema);
