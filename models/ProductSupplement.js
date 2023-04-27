const mongoose = require("mongoose");

const productSupplementSchema = new mongoose.Schema({
  supplement: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Supplement",
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
});

module.exports = mongoose.model("ProductSupplement", productSupplementSchema);