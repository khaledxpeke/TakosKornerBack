const History = require("../models/History");
const Product = require("../models/product");
const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
require("dotenv").config();
const jwtSecret = process.env.JWT_SECRET;
app.use(express.json());

exports.addHistory = (req, res) => {
  const { products, pack, total } = req.body;

  // Create a new history object with the provided products, pack, and total
  const history = new History({
    product: products.map((product) => ({
      plat: product.plat,
      addons: product.addons,
    })),
    pack,
    total,
  });

  // Save the new history object to the database
  history
    .save()
    .then((result) => {
      res.status(201).json(
        result,
      );
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
};
