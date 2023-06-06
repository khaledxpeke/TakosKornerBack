const NoIngredient = require("../models/NoIngredient");
const Product = require("../models/product");
const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
require("dotenv").config();
const jwtSecret = process.env.JWT_SECRET;
app.use(express.json());
const multer = require("multer");
const multerStorage = require("../middleware/multerStorage");

const upload = multer({ storage: multerStorage });

exports.createNoIngredient = async (req, res, next) => {
  upload.single("image")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        message: "Image upload failed",
        error: err.message,
      });
    }
    const { name, typeId } = req.body;
    const userId = req.user.user._id;
    const image = req.file.path;
    try {
      const noingredient = await NoIngredient.create({
        name,
        image,
        createdBy: userId,
        type: typeId,
      });
      await noingredient.save();
      res.status(201).json(noingredient);
    } catch (error) {
      res.status(400).json({
        message: "Some error occured",
        error: error.message,
      });
    }
  });
};

exports.addNoIngredientToProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { noingredientId } = req.body;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        message: `Product not found with ID: ${productId}`,
      });
    }

    const noingredient = await NoIngredient.findById(noingredientId);
    if (!noingredient) {
      return res.status(404).json({
        message: `NoIngredient not found with ID: ${noingredientId}`,
      });
    }

    // Check if the noingrediant already exists in the product
    const noingrediantIndex = product.noingredients.findIndex(
      (noingredient) => noingredient.toString() === noingredientId
    );
    if (noingrediantIndex !== -1) {
      return res.status(409).json({
        message: `NoIngrediant with ID ${noingredientId} already exists in the product`,
      });
    }
    product.noingredients.push(noingredient);
    if (!product.type.includes(noingredient.type)) {
      product.type.push(noingredient.type);
    }
    await product.save();
    noingredient.product.push(productId);
    await noingredient.save();
    res.status(200).json({
      product,
    });
  } catch (error) {
    res.status(400).json({
      message: "Some error occured",
      error: error.message,
    });
  }
};

exports.getNoIngredients = async (req, res, next) => {
  try {
    const noingredient = await NoIngredient.find();
    res.status(200).json(noingredient);
  } catch (error) {
    res.status(400).json({
      message: "Some error occured",
      error: error.message,
    });
  }
};

exports.getNoIngrediantByProduct = async (req, res, next) => {
    const { productId } = req.params;
    try {
      const noingredients = await NoIngredient.find({ product: productId }).populate(
        "type"
      );
      res.status(200).json(noingredients);
    } catch (error) {
      res.status(400).json({
        message: "No Noingrediants found",
        error: error.message,
      });
    }
  };

exports.getNoIngredientById = async (req, res, next) => {
  try {
    const { noingredientId } = req.params;
    const noingredient = await NoIngredient.findById(noingredientId);
    if (!noingredient) {
      return res.status(404).json({
        message: `NoIngredient not found with ID: ${noingredientId}`,
      });
    }
    res.status(200).json(noingredient);
  } catch (error) {
    res.status(400).json({
      message: "Some error occured",
      error: error.message,
    });
  }
};

exports.updateNoIngredient = async (req, res, next) => {
  upload.single("image")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        message: "Image upload failed",
        error: err.message,
      });
    }
    const { noingredientId } = req.params;
    const { name } = req.body;
    const image = req.file.path;
    try {
      const noingredient = await NoIngredient.findById(noingredientId);
      if (!noingredient) {
        return res.status(404).json({
          message: `NoIngredient not found with ID: ${noingredientId}`,
        });
      }
      noingredient.name = name;
      noingredient.image = image;
      await noingredient.save();
      res.status(200).json(noingredient);
    } catch (error) {
      res.status(400).json({
        message: "Some error occured",
        error: error.message,
      });
    }
  });
};

exports.deleteNoIngredient = async (req, res, next) => {
  try {
    const { noingredientId } = req.params;
    const noingredient = await NoIngredient.findById(noingredientId);
    if (!noingredient) {
      return res.status(404).json({
        message: `NoIngredient not found with ID: ${noingredientId}`,
      });
    }
    await noingredient.deleteOne({ _id: noingredient._id });

    await Product.findByIdAndUpdate(noingredient.product, {
      $pull: { noingredients: noingredientId },
    });
    res.status(200).json({
      message: `NoIngredient deleted successfully`,
    });
  } catch (error) {
    res.status(400).json({
      message: "Some error occured",
      error: error.message,
    });
  }
};
