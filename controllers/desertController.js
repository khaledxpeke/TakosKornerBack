const Desert = require("../models/desert");
const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
require("dotenv").config();
const jwtSecret = process.env.JWT_SECRET;
app.use(express.json());

exports.addDesert = async (req, res, next) => {
  const { name, price, image } = req.body;
  try {
    const deserts = await Desert.create({
      name,
      price,
      image,
    });
    res.status(201).json({
      deserts,
    });
  } catch (error) {
    res.status(400).json({
      message: "Some error occured",
      error: error.message,
    });
  }
};

exports.getAllDeserts = async (req, res, next) => {
  try {
    const deserts = await Desert.find({});
    res.status(200).json({
      deserts,
    });
  } catch (error) {
    res.status(400).json({
      message: "No deserts found",
      error: error.message,
    });
  }
};

exports.getDesertById = async (req, res, next) => {
  try {
    const { desertId } = req.params;
    const deserts = await Desert.findById(desertId);
    res.status(200).json({
      deserts,
    });
  } catch (error) {
    res.status(400).json({
      message: "No desert found",
      error: error.message,
    });
  }
};

exports.deleteDesert = async (req, res, next) => {
  try {
    const { desertId } = req.params;
    const deserts = await Desert.findByIdAndDelete(desertId);
    res.status(200).json({
      message: "Desert successfully deleted",
    });
  } catch (error) {
    res.status(400).json({
      message: "No desert found to be deleted",
      error: error.message,
    });
  }
};

exports.updateDesert = async (req, res, next) => {
  const { desertId } = req.params;
  const { name, price, image } = req.body;
  try {
    const deserts = await Desert.findByIdAndUpdate(desertId, {
      name,
      price,
      image,
    });
    res.status(200).json({ deserts, message: "deserts successfully updated" });
  } catch (error) {
    res.status(400).json({
      message: "No desert found",
      error: error.message,
    });
  }
};
