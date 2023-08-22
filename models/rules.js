const mongoose = require("mongoose");

const ruleSchema = mongoose.Schema({
  free: {
    type: Number,
    default: 1,
  },
  quantity: {
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
