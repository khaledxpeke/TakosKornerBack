const Supplement = require("../models/supplement");
const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
require("dotenv").config();
const jwtSecret = process.env.JWT_SECRET;
app.use(express.json());
const multer = require("multer");
const multerStorage = require("../middleware/multerStorage");

const upload = multer({ storage: multerStorage });
exports.addSupplement = async (req, res, next) => {
  
  upload.single("image")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        message: "Image upload failed",
        error: err.message,
      });
    }
    const { name, price, currency, product } = req.body;
    const userId = req.user.id;
    const image = req.file.path;
    try {
      const supplements = await Supplement.create({
        name,
        price,
        image,
        currency,
        product,
        createdBy: userId,
      });
      res.status(201).json({
        supplements,
      });
    } catch (error) {
      res.status(400).json({
        message: "Some error occured",
        error: error.message,
      });
    }
  });
};

exports.getSupplementByProduct = async (req, res, next) => {
  const { productId } = req.params;
  try {
    const supplements = await Supplement.find({ product: productId });
    res.status(200).json(supplements);
  } catch (error) {
    res.status(400).json({
      message: "No supplements found",
      error: error.message,
    });
  }
};

exports.getAllSupplements = async (req, res, next) => {
  try {
    const supplements = await Supplement.find();
    res.status(200).json(supplements);
  } catch (error) {
    res.status(400).json({
      message: "No supplements found",
      error: error.message,
    });
  }
};

exports.getSupplementById = async (req, res, next) => {
  try {
    const { supplementId } = req.params;
    const supplements = await Supplement.findById(supplementId);
    res.status(200).json({
      supplements,
    });
  } catch (error) {
    res.status(400).json({
      message: "No supplement found",
      error: error.message,
    });
  }
};

exports.deleteSupplement = async (req, res, next) => {
  try {
    const { supplementId } = req.params;
    const userId = req.user.id;
    const supplements = await Supplement.findByIdAndDelete(supplementId);
    res.status(200).json({
      supplements,
      createdBy: userId,
    });
  } catch (error) {
    res.status(400).json({
      message: "No supplement found",
      error: error.message,
    });
  }
};
