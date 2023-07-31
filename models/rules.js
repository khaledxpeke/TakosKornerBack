const mongoose = require("mongoose");

const ruleSchema = mongoose.Schema({
  numberOfFree: {
    type: Number,
    default: 1,
  },
  maxIngrediant: {
    type: Number,
    default: 1,
  },
  type: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Type",
    required: true,
  },
});

module.exports = mongoose.model("Rule", ruleSchema);
