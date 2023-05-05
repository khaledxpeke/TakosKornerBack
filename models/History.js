const mongoose = require("mongoose");

const historySchema = mongoose.Schema({
  plat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  addons: [
    {
      _id: { type: String, required: true },
      name: { type: String, required: true },
      currency: { type: String },
      price: { type: Number },
      image: { type: String },
    },
  ],
  pack: {
    type: String,
    required: true,
  },
  total: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("History", historySchema);
