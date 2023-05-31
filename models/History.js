const mongoose = require("mongoose");

const historySchema = mongoose.Schema({
  product: [
    {
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
  boughtAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("History", historySchema);
