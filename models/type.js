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
    },
    payment: {
      type: String,
      default: false,
    },
    selection: {
      type: String,
      default: false,
    },
    quantity : {
      type: Number,
      default: 1,
    },
  });
  
  module.exports = mongoose.model("Type", typeSchema);