const mongoose = require("mongoose");
const methodSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { _id: true });
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
  address: {
    type: String,
  },
  method: [methodSchema],
});

module.exports = mongoose.model("Settings", settingsSchema);
