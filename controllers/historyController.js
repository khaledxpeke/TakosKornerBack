const History = require("../models/History");
const Product = require("../models/product");
const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
require("dotenv").config();
const jwtSecret = process.env.JWT_SECRET;
app.use(express.json());

exports.addHistory = async (req, res) => {
  const { products, pack, total } = req.body;

  const history = new History({
    product: products.map((product) => ({
      plat: product.plat,
      addons: product.addons,
    })),
    pack,
    total,
  });

  history
    .save()
    .then((result) => {
      res.status(201).json(result);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        message: "Some error occured",
        error: err,
      });
    });
};

exports.getHistory = async (req, res) => {
  const history = await History.find();
  res.status(200).json(history);
}
