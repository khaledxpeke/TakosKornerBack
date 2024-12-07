const Settings = require("../models/settings");
const express = require("express");
const app = express();
require("dotenv").config();
app.use(express.json());

exports.addSettings = async (req, res) => {
  try {
    const { currency } = req.body;
    if (!currency) {
      return res.status(400).json({ message: "Currency is required" });
    }

    const existing = await Settings.findOne();
    if (existing) {
      if (existing.currencies.includes(currency.toUpperCase())) {
        return res.status(400).json({ message: "Currency already exists" });
      }

      existing.currencies.push(currency.toUpperCase());

        await existing.save();
        return res.status(200).json(existing);
    } else {
      if (currency === undefined ) {
        return res
          .status(400)
          .json({ message: "Currency is required" });
      }
      const newSettings = new Settings({
        currencies: [currency.toUpperCase()],
        defaultCurrency: currency.toUpperCase(),
      });
      await newSettings.save();
      return res.status(201).json(newSettings);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSettings = async (req, res) => {
  try {
    const settings = await Settings.findOne();
    if (!settings) {
      return res.status(404).json({ message: "No settings found" });
    }

    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllCurrencies = async (req, res) => {
  try {
    const currencies = await Settings.findOne();
    if (!currencies) {
      return res.status(404).json({ message: "No currencies found" });
    }

    res.status(200).json({
      currencies: currencies.currencies,
      defaultCurrency: currencies.defaultCurrency,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateDefaultCurrency = async (req, res) => {
  try {
    const { defaultCurrency } = req.body;
    if (!defaultCurrency) {
      return res.status(400).json({ message: "Default currency is required" });
    }

    const currencyDoc = await Settings.findOne();
    if (
      !currencyDoc ||
      !currencyDoc.currencies.includes(defaultCurrency.toUpperCase())
    ) {
      return res.status(400).json({ message: "Invalid currency" });
    }

    currencyDoc.defaultCurrency = defaultCurrency.toUpperCase();
    await currencyDoc.save();

    res.status(200).json({
      message: "Default currency updated",
      defaultCurrency: currencyDoc.defaultCurrency,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteCurrency = async (req, res) => {
  try {
    const { currency } = req.body;
    if (!currency) {
      return res.status(400).json({ message: "Currency is required" });
    }

    const currencyDoc = await Settings.findOne();
    if (!currencyDoc || !currencyDoc.currencies.includes(currency.toUpperCase())) {
      return res.status(400).json({ message: "Currency not found" });
    }

    currencyDoc.currencies = currencyDoc.currencies.filter(
      (c) => c !== currency.toUpperCase()
    );
    if (currencyDoc.defaultCurrency === currency.toUpperCase()) {
      currencyDoc.defaultCurrency = currencyDoc.currencies[0];
    }

    await currencyDoc.save();
    res.status(200).json({
      message: "Currency deleted",
      currencies: currencyDoc.currencies,
      defaultCurrency: currencyDoc.defaultCurrency,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

exports.updateCurrencyOrTva = async (req, res) => {
  try {
    const { oldCurrency, newCurrency, tva } = req.body;

    const settings = await Settings.findOne();
    if (!settings) {
      return res.status(404).json({ message: "Settings not found" });
    }

    if (oldCurrency && newCurrency) {
      const oldCurrencyUpper = oldCurrency.toUpperCase();
      const newCurrencyUpper = newCurrency.toUpperCase();

      if (!settings.currencies.includes(oldCurrencyUpper)) {
        return res.status(400).json({ message: "Old currency not found in the list" });
      }

      if (settings.currencies.includes(newCurrencyUpper)) {
        return res.status(400).json({ message: "New currency already exists in the list" });
      }

      settings.currencies = settings.currencies.map((c) =>
        c === oldCurrencyUpper ? newCurrencyUpper : c
      );

      if (settings.defaultCurrency === oldCurrencyUpper) {
        settings.defaultCurrency = newCurrencyUpper;
      }
    }

    if (tva !== undefined) {
      if (tva < 0) {
        return res.status(400).json({ message: "TVA must be a positive number" });
      }
      settings.tva = tva;
    }

    await settings.save();

    res.status(200).json({
      message: "Settings updated successfully",
      settings,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

