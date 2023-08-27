const mongoose = require("mongoose");

const ingrediantSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  image: {
    type: String,
    default:
      "https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    required: true,
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
  currency: {
    type: String,
    validate: {
      validator: function () {
        return !this.currency || this.price; // Require currency only if price is provided
      },
      message: "Currency is required when price is provided",
    },
  },
  price: {
    type: Number,
    validate: {
      validator: function () {
        return !this.price || this.currency; // Require price only if currency is provided
      },
      message: "Price is required when currency is provided",
    },
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});
ingrediantSchema.add({
  price: {
    type: Number,
    required: function () {
      return this.currency != null; // Require price only if currency is provided
    },
  },
  currency: {
    type: String,
    required: function () {
      return this.price != null; // Require currency only if price is provided
    },
  },
});
module.exports = mongoose.model("Ingrediant", ingrediantSchema);