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
  maxExtras:{
    type: Number,
  },
  maxDessert:{
    type: Number,
  },
  maxDrink:{
    type: Number,
  },
  logo: {
    type: String,
    default: "uploads/default-logo.png"
  },
  banner: {
    type: String,
    default: "uploads/default-banner.png"
  },
});

module.exports = mongoose.model("Settings", settingsSchema);
