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
    min: {
      type: Number,
      default: 0,
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