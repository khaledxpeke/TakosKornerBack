const mongoose = require("mongoose");
const NoIngredientSchema = mongoose.Schema({
    name: {
      type: String,
      required: true,
      unique: true,
    },
    product: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    type: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Type",
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
  });
  
  module.exports = mongoose.model("NoIngredient", NoIngredientSchema);