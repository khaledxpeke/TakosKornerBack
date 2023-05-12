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
  });
  
  module.exports = mongoose.model("NoIngredient", NoIngredientSchema);