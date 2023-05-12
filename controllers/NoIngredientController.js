const NoIngredient = require("../models/NoIngredient");
const Product = require("../models/product");
const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
require("dotenv").config();
const jwtSecret = process.env.JWT_SECRET;
app.use(express.json());

exports.createNoIngredient = async (req, res, next) => {
  upload.single("image")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        message: "Image upload failed",
        error: err.message,
      });
    }
    const { name } = req.body;
    const userId = req.user.id;
    const image = req.file.path;
    try {
      const noingredient = await NoIngredient.create({
        name,
        image,
        createdBy: userId,
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
    
        product.noingredient.push(noingredientId);
        await product.save();
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
    }

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
    }