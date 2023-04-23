const Product = require("../models/product");
const Category = require("../models/category");
const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
require("dotenv").config();
const jwtSecret = process.env.JWT_SECRET;
app.use(express.json());

exports.addProductToCategory = async (req, res, next) => {
  const { categoryId } = req.params;
  const { name, price, image, currency, supplements } = req.body;
  const userId = req.user.id;

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
        image,
        category: categoryId,
        currency,
        supplements,
        createdBy: userId,
      });

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
  const { name, price, image, currency, supplements } = req.body;
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