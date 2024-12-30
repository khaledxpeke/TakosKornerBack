const mongoose = require("mongoose");
const variationSchema = mongoose.Schema({
    name: {
      type: String,
      required: true,
      unique: true,
    },
  });
  
  module.exports = mongoose.model("Variation", variationSchema);