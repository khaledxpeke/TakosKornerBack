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
    max: {
      type: Number,
      default: 1,
    },
  });
  
  module.exports = mongoose.model("Type", typeSchema);