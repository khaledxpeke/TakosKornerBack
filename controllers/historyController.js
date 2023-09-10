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
      extras: product.extras,
    })),
    pack,
    total,
  });
  console.log("Before saving history:", history);
  history
    .save()
    .then((result) => {
      console.log("History saved:", result);
      res.status(201).json(result);
    })
    .catch((err) => {
      console.log("Error occurred while saving history:", err);
      res.status(500).json({
        message: "Some error occured",
        error: err,
      });
    });
};

exports.getHistory = async (req, res) => {
  const history = await History.find()
    .sort({ boughtAt: -1 })
    .populate({
      path: "product",
      populate: [
        {
          path: "plat.category",
          select: "name",
        },
      ],
    });
  res.status(200).json(history);
};

exports.getLast10Orders = async (req, res) => {
  try {
    const orders = await History.find()
      .sort({ boughtAt: -1 })
      .limit(10)
      .populate("product.plat._id");

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
    throw error;
  }
};

exports.getCommandNumber = async (req, res) => {
  const currentDate = new Date();

  try {
    const lastHistoryEntry = await History.findOne({}, null, {
      sort: { boughtAt: -1 },
    });

    let lastCommandNumber = lastHistoryEntry
      ? lastHistoryEntry.commandNumber
      : 0;
    const lastCommandDate = lastHistoryEntry.boughtAt;
    const daysDifference = Math.floor(
      (currentDate - lastCommandDate) / (1000 * 60 * 60 * 24)
    );
    if (daysDifference > 0) {
      lastCommandNumber = 1;
    } else {
      lastCommandNumber++;
    }

    res.status(200).json(lastCommandNumber);
  } catch (error) {
    console.error("Error getting command number:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
