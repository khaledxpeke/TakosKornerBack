const Supplement = require("../models/supplement");
const Product = require("../models/product");
const ProductSupplement = require("../models/ProductSupplement");
const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
require("dotenv").config();
const jwtSecret = process.env.JWT_SECRET;
app.use(express.json());
const multer = require("multer");
const multerStorage = require("../middleware/multerStorage");
const fs = require("fs");

const upload = multer({ storage: multerStorage });
exports.createSupplement = async (req, res, next) => {
  upload.single("image")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        message: "Image upload failed",
        error: err.message,
      });
    }
    const { name, price, currency } = req.body;
    const userId = req.user.id;
    const image = req.file.path;
    try {
      const supplements = await Supplement.create({
        name,
        price,
        image,
        currency,
        createdBy: userId,
      });
      res.status(201).json({
        supplements,message:"supplement created successfully"
      });
    } catch (error) {
      res.status(400).json({
        message: "Some error occured",
        error: error.message,
      });
    }
  });
};
exports.addSupplementToProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { supplementId } = req.body;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        message: `Product not found with ID: ${productId}`,
      });
    }

    const supplement = await Supplement.findById(supplementId);
    if (!supplement) {
      return res.status(404).json({
        message: `Supplement not found with ID: ${supplementId}`,
      });
    }

    if (product.supplements.includes(supplementId)) {
      return res.status(409).json({
        message: `Supplement with ID ${supplementId} already exists in the product`,
      });
    }

    // Add the product ID to the supplement's "products" array
    supplement.products.push(productId);
    await supplement.save();

    // Add the supplement ID to the product's "supplements" array
    product.supplements.push(supplementId);
    await product.save();

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({
      message: "Some error occurred while adding supplement to product",
      error: error.message,
    });
  }
};

exports.getSupplementByProduct = async (req, res, next) => {
  const { productId } = req.params;
  try {
    const supplements = await Supplement.find({ products: productId });
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
  const { supplementId } = req.params;
  try {
    const supplements = await Supplement.findById(supplementId);

    if (!supplements) {
      return res.status(404).json({
        message: "Supplement not found",
      });
    }
    if (supplements.image) {
      fs.unlink(supplements.image, (err) => {
        if (err) {
          res.status(500).json({
            message: "supplements image not found",
          });
        }
      });
    }

    await Supplement.deleteOne({ _id: supplements._id });

    // Remove the ingredient from the product's ingredients array
    await Product.findByIdAndUpdate(supplements.product, {
      $pull: { supplements: supplementId },
    });

    res.status(200).json({
      message: "Supplement deleted successfully",
      supplements,
    });
  } catch (error) {
    res.status(500).json({
      message: "Some error occurred",
      error: error.message,
    });
  }
};
