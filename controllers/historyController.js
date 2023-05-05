const History = require("../models/History");
const Product = require("../models/product");
const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
require("dotenv").config();
const jwtSecret = process.env.JWT_SECRET;
app.use(express.json());

exports.addHistory = async (req, res) => {
  const { plat, addons, pack, total } = req.body;

  try {
    const product = await Product.findById(plat);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const newHistory = new History({
      plat,
      addons,
      pack,
      total,
    });

    const savedHistory = await newHistory.save();
    res
      .status(201)
      .json({ message: "History saved successfully", savedHistory });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error saving history" });
  }
};
