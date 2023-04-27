const Ingrediant = require("../models/ingrediant");
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
exports.addIngrediant = async (req, res, next) => {
  upload.single("image")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        message: "Image upload failed",
        error: err.message,
      });
    }
    const { name, typeId, product } = req.body;
    const productIds = product?.split(",") || [];
    const userId = req.user.id;
    const image = req.file.path;
    try {
      const ingrediant = await Ingrediant.create({
        name,
        image,
        type: typeId,
        product: productIds,
        createdBy: userId,
      });
      await ingrediant.save();
      for (let i = 0; i < productIds.length; i++) {
        const productId = productIds[i];
        const product = await Product.findById(productId);
        if (!product) {
          return res.status(404).json({
            message: `Product not found with ID: ${productId}`,
          });
        }
        product.ingrediants.push(ingrediant);
        if (!product.type.includes(typeId)) {
          product.type.push(typeId);
        }
        await product.save();
      }

      res.status(201).json(ingrediant);
    } catch (error) {
      res.status(400).json({
        message: "Some error occured",
        error: error.message,
      });
    }
  });
};

exports.getIngrediantByProduct = async (req, res, next) => {
  const { productId } = req.params;
  try {
    const ingrediants = await Ingrediant.find({ product: productId }).populate(
      "type"
    );
    res.status(200).json(ingrediants);
  } catch (error) {
    res.status(400).json({
      message: "No ingrediants found",
      error: error.message,
    });
  }
};

exports.getIngredientsByType = async (req, res, next) => {
  const { productId, typeId } = req.params;

  try {
    const ingrediants = await Ingrediant.find({
      product: productId,
      type: typeId,
    }).populate("type");
    res.status(200).json(ingrediants);
  } catch (error) {
    res.status(500).json({
      message: "Some error occured",
      error: error.message,
    });
  }
};

exports.updateIngrediant = async (req, res, next) => {
  const { id } = req.params;
  const { name, image, type } = req.body;

  try {
    const ingrediant = await Ingrediant.findById(id);

    if (!ingrediant) {
      return res.status(404).json({ message: "Ingredient not found" });
    }

    // Update the fields
    ingrediant.name = name || ingrediant.name;
    ingrediant.image = image || ingrediant.image;
    ingrediant.type = type || ingrediant.type;

    await ingrediant.save();

    res.status(200).json({
      ingrediant,
    });
  } catch (error) {
    res.status(500).json({
      message: "Some error occured",
      error: error.message,
    });
  }
};

exports.deleteIngredient = async (req, res, next) => {
  const { ingrediantId } = req.params;

  try {
    const ingrediant = await Ingrediant.findById(ingrediantId);

    if (!ingrediant) {
      return res.status(404).json({
        message: "Ingredient not found",
      });
    }

    await Ingrediant.deleteOne({ _id: ingrediant });

    // Remove the ingredient from the product's ingredients array
    await Product.findByIdAndUpdate(ingrediant.product, {
      $pull: { ingrediants: ingrediantId },
    });

    res.status(200).json({
      message: "Ingredient deleted successfully",
      ingrediant,
    });
  } catch (error) {
    res.status(500).json({
      message: "Some error occurred",
      error: error.message,
    });
  }
};
