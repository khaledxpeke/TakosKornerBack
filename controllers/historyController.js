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
  const decodedList = JSON.parse(products);
  const history = await new History({
    product: decodedList.map((product) => ({
      plat: product.plat,
      addons: product.addons,
    })),
    pack,
    total,
  });
  console.log('Before saving history:', history);
  history
    .save()
    .then((result) => {
      console.log('History saved:', result);
      res.status(201).json(result);
    })
    .catch((err) => {
      console.log('Error occurred while saving history:', err);
      res.status(500).json({
        message: "Some error occured",
        error: err,
      });
    });
};

exports.getHistory = async (req, res) => {
  const history = await History.find().populate({
    path: "product",
    populate: [
      {
        path: "plat",
        select: "name currency price",
      },
    ],
  });
  res.status(200).json(history);
}
