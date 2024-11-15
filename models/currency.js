const mongoose = require("mongoose");

const currencySchema = new mongoose.Schema({
    currencies: {
        type: [String], 
        required: true,
      },
      defaultCurrency: {
        type: String, 
        required: true,
        uppercase: true,
      },
});

module.exports = mongoose.model("Currency", currencySchema);
