const mongoose = require("mongoose");

const historySchema = mongoose.Schema({
  product: [
    {
      plat: {
        _id: { type: String, required: true },
        category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
        name: { type: String, required: true },
        price: { type: Number },
      },
      addons: [
        {
          _id: { type: String },
          name: { type: String, required: true },
          count: { type: Number },
          total: { type: Number },
          pu: { type: Number },
        },
      ],
      extras: [
        {
          _id: { type: String, required: true },
          name: { type: String, required: true },
          price: { type: Number },
          count: { type: Number },
          total: { type: Number },
          pu: { type: Number },
        },
      ],
      total: { type: Number },
      currency: { type: String },
    }, 
  ],
  pack: {
    type: String,
    required: true,
  },
  method: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  // email: {
  //   type: String,
  //   required: true,
  // },
  total: {
    type: String,
    required: true,
  },
  commandNumber: {
    type: Number,
  },
  boughtAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("History", historySchema);
