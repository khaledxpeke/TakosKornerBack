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
      type: Boolean,
      default: false,
    },
    selection: {
      type: Boolean,
      default: false,
    },
    quantity : {
      type: Number,
      default: 1,
    },
  });
  
  module.exports = mongoose.model("Type", typeSchema);