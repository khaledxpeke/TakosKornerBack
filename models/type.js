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
    isRequired: {
      type: Boolean,
      default: false,
    }
  });
  
  module.exports = mongoose.model("Type", typeSchema);