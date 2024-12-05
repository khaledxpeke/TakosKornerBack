const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema({
  currencies: {
    type: [String],
    required: true,
  },
  defaultCurrency: {
    type: String,
    required: true,
    uppercase: true,
  },
  tva: {
    type: Number,
    required: true,
    min: 0,
  },
});

module.exports = mongoose.model("Settings", settingsSchema);
