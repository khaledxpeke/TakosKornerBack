const mongoose = require("mongoose");

const historySchema = mongoose.Schema({
  category: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  }],
  product: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  }],
  ingrediant: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ingrediant",
    required: true,
  }],
  supplement:[ {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Supplement",
    required: true,
  }],
  desert: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Desert",
    required: true,
  }],
  pack: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Pack",
    required: true,
  },
  date: {
    type: Date,
    default: Date.now(),
    required: true,
  },
});

module.exports = mongoose.model("History", historySchema);
