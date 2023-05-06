const Product = require("../models/product");
const Category = require("../models/category");
const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
require("dotenv").config();
const jwtSecret = process.env.JWT_SECRET;
const multer = require("multer");
const multerStorage = require("../middleware/multerStorage");
app.use(express.json());
// Set up multer upload middleware with the imported storage configuration
const upload = multer({ storage: multerStorage });

exports.addProductToCategory = async (req, res, next) => {
  upload.single("image")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        message: "Image upload failed",
        error: err.message,
      });
    }
    const { categoryId } = req.params;
    const userId = req.user.id;
    const price = Number(req.body.price ?? "");
    const name = req.body.name.replace(/"/g, "");
    const image = req.file.path; // Get the image file path from the request
    const { currency, type, maxMeat } = req.body;
    const typeIds = type?.split(",") || [];
    try {
      let product = await Product.findOne({ name });

      if (product) {
        return res.status(400).json({
          message: "Product already exists",
        });
      } else {
        const product = new Product({
          name,
          price,
          category: categoryId,
          currency,
          type: typeIds,
          createdBy: userId,
        });
        if (image) {
          product.image = image;
          await product.save();
        }
        if (typeIds.includes("meat")) {
          product.maxMeat = maxMeat ; // set maxMeat to the value from the request body or default to 3
        }
        const savedProduct = await product.save();

        const updatedCategory = await Category.findByIdAndUpdate(
          categoryId,
          { $push: { products: savedProduct._id } },
          { new: true }
        );

        res.status(201).json({
          product: savedProduct,
          category: updatedCategory,
        });
      }
    } catch (error) {
      res.status(400).json({
        message: "Some error occured",
        error: error.message,
      });
    }
  });
};

exports.getProductsByCategory = async (req, res, next) => {
  const { categoryId } = req.params;

  try {
    const products = await Product.find({ category: categoryId }).populate(
      "supplements"
    );

    res.status(200).json(products);
  } catch (error) {
    res.status(400).json({
      message: "Some error occured",
      error: error.message,
    });
  }
};

exports.deleteProduct = async (req, res, next) => {
  const { productId } = req.params;
  const userId = req.user.id;
  try {
    const product = await Product.findById({
      _id: productId,
      createdBy: userId,
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await product.remove();

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(400).json({
      message: "Some error occured",
      error: error.message,
    });
  }
};

exports.updateProduct = async (req, res, next) => {
  const { productId } = req.params;
  const { name, price, image, currency, supplements,maxMeat } = req.body;
  const userId = req.user.id;

  try {
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.createdBy !== userId) {
      return res
        .status(403)
        .json({ message: "You do not have permission to update this product" });
    }

    product.name = name;
    product.price = price;
    product.image = image;
    product.currency = currency;
    product.supplements = supplements;
    product.maxMeat = maxMeat;

    const updatedProduct = await product.save();

    res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    res.status(400).json({
      message: "Some error occured",
      error: error.message,
    });
  }
};
