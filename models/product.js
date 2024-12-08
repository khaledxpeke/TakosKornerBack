const Mongoose = require("mongoose");
const Settings = require("./settings");
const ProductSchema = new Mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  image: {
    type: String,
    required: true,
    default:
      "https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  },
  currency: {
    type: String,
  },
  category: {
    type: Mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  supplements: [{ type: Mongoose.Schema.Types.ObjectId, ref: "Supplement" }],
  ingrediants: [{ type: Mongoose.Schema.Types.ObjectId, ref: "Ingrediant" }],
  type : [{
    type: Mongoose.Schema.Types.ObjectId,
    ref: "Type",
    required: true,
  }],
  createdBy: {
    type: Mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  choice: {
    type: String,
    default: "seul",
    enum: ["seul", "multiple"],
    required: true,
  },
  rules : [{
    type: Mongoose.Schema.Types.ObjectId,
    ref: "Rule",
  }],
  maxExtras:{
    type: Number,
  },
  maxDessert:{
    type: Number,
  },
  maxDrink:{
    type: Number,
  },
});

ProductSchema.pre("save", async function (next) {
  try {
    const settings = await Settings.findOne(); 
    if (!settings) {
      throw new Error("Settings not configured.");
    }

    if (!this.currency) {
      this.currency = settings.defaultCurrency;
    }

    if (!settings.currencies.includes(this.currency)) {
      throw new Error(`Invalid currency. Allowed values are: ${settings.currencies.join(", ")}`);
    }

    next();
  } catch (error) {
    next(error);
  }
});

const Product = Mongoose.model("Product", ProductSchema);
module.exports = Product;
