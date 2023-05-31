const Product = require("../models/product");
const Category = require("../models/category");
const Ingrediant = require("../models/ingrediant");
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
    const { currency, type, maxIngrediant } = req.body;
    const typeIds = type?.split(",") || [];
    const ingrediantIds = req.body.ingrediants?.split(",") || [];
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
          maxIngrediant,
          ingrediants: ingrediantIds,
        });
        if (image) {
          product.image = image;
          await product.save();
        }
        const savedProduct = await product.save();

        const updatedCategory = await Category.findByIdAndUpdate(
          categoryId,
          { $push: { products: savedProduct._id } },
          { new: true }
        );

        await Ingrediant.updateMany(
          { _id: { $in: ingrediantIds } },
          { $push: { product: savedProduct._id } }
        );

        res.status(201).json({
          product: savedProduct,
          category: updatedCategory,
          message: "Product added successfully",
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
exports.getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.find({});
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
  try {
    const product = await Product.findByIdAndDelete({
      _id: productId,
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    await Category.updateMany(
      { products: productId },
      { $pull: { products: productId } }
    );
    await Ingrediant.updateMany(
      { product: productId },
      { $pull: { product: productId } }
    );
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
  const { name, price, image, currency, supplements, maxIngrediant } = req.body;

  try {
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.name = name;
    product.price = price;
    product.image = image;
    product.currency = currency;
    product.supplements = supplements;
    product.maxIngrediant = maxIngrediant;

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
