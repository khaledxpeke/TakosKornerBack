const History = require("../models/History");
const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
require("dotenv").config();
const jwtSecret = process.env.JWT_SECRET;
app.use(express.json());

exports.addHistory = async (req, res, next) => {
  const {
    categoryIds,
    productIds,
    ingrediantIds,
    supplementIds,
    desertIds,
    pack,
  } = req.body;
  try {
    const historyData = {
      category: categoryIds,
      product: productIds,
      ingrediant: ingrediantIds,
      supplement: supplementIds,
      desert: desertIds,
      pack: pack,
    };
    const history = await History.create(historyData);

    res.status(201).json({
        history,
    });
  } catch (error) {
    res.status(400).json({
      message: "Some error occurred",
      error: error.message,
    });
  }
};

exports.getAllHistory = async (req, res, next) => {
  try {
    const history = await History.find().populate([
      "category",
      "product",
      "ingrediant",
      "supplement",
      "desert",
      "pack",
    ]);
    res.status(200).json(history);
  } catch (error) {
    res.status(400).json({
      message: "No history found",
      error: error.message,
    });
  }
};

exports.getHistoryById = async (req, res, next) => {
  try {
    const { historyId } = req.params;
    const history = await History.findById(historyId).populate([
      "category",
      "product",
      "ingredient",
      "supplement",
      "desert",
      "pack",
    ]);
    res.status(200).json({
      history,
    });
  } catch (error) {
    res.status(400).json({
      message: "No history found",
      error: error.message,
    });
  }
};

exports.deleteHistory = async (req, res, next) => {
  try {
    const { historyId } = req.params;
    const history = await History.findByIdAndDelete(historyId);
    res.status(200).json({
      message: "History successfully deleted",
    });
  } catch (error) {
    res.status(400).json({
      message: "No history found to be deleted",
      error: error.message,
    });
  }
};

exports.updateHistory = async (req, res, next) => {
  const { historyId } = req.params;
  const { category, product, ingredient, supplement, desert, pack } = req.body;
  try {
    const history = await History.findByIdAndUpdate(historyId, {
      category,
      product,
      ingredient,
      supplement,
      desert,
      pack,
    });
    res.status(200).json({ history, message: "History successfully updated" });
  } catch (error) {
    res.status(400).json({
      message: "No history found",
      error: error.message,
    });
  }
};
