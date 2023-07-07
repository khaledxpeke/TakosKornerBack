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
  });
  
  module.exports = mongoose.model("Type", typeSchema);