const Currency = require("../models/currency");
const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
require("dotenv").config();
app.use(express.json());


exports.addCurrency = async (req, res) => {
    try {
      const { currency } = req.body;
      if (!currency) {
        return res.status(400).json({ message: "Currency is required" });
      }
  
      const existing = await Currency.findOne();
      if (existing) {
        if (existing.currencies.includes(currency.toUpperCase())) {
          return res.status(400).json({ message: "Currency already exists" });
        }
  
        existing.currencies.push(currency.toUpperCase());
        await existing.save();
      } else {
        await Currency.create({
          currencies: [currency.toUpperCase()],
          defaultCurrency: currency.toUpperCase(),
        });
      }
  
      res.status(200).json({ message: "Currency added successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

exports.getAllCurrencies = async (req, res) => {
    try {
      const currencies = await Currency.findOne();
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
  
      const currencyDoc = await Currency.findOne();
      if (!currencyDoc || !currencyDoc.currencies.includes(defaultCurrency.toUpperCase())) {
        return res.status(400).json({ message: "Invalid currency" });
      }
  
      currencyDoc.defaultCurrency = defaultCurrency.toUpperCase();
      await currencyDoc.save();
  
      res.status(200).json({ message: "Default currency updated", defaultCurrency: currencyDoc.defaultCurrency });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
