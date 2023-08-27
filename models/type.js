const mongoose = require("mongoose");
const typeSchema = mongoose.Schema({
    name: {
      type: String,
      required: true,
      unique: true,
    },
    message: {
      type: String,
    },
    price: {
      type: Number,
      default: 0,
    },
    isRequired: {
      type: Boolean,
      default: false,
    }
  });
  
  module.exports = mongoose.model("Type", typeSchema);