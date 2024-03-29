const Type = require("../models/type");
const Ingrediant = require("../models/ingrediant");
const Product = require("../models/product");
const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
require("dotenv").config();
const jwtSecret = process.env.JWT_SECRET;
app.use(express.json());
const fs = require("fs");
const path = require("path");

exports.createType = async (req, res, next) => {
  const { name, message,isRequired } = req.body;

  try {
    // Check if the type already exists
    const existingType = await Type.findOne({ name });
    if (existingType) {
      return res.status(400).json({ message: "Type existe déja" });
    }

    // Create a new type
    const newType = new Type({
      name,
      message,
      isRequired
    });
    await newType.save();

    res.status(201).json({ message: "Type créer avec succées" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Some error occurred", error: error.message });
  }
};

exports.getAllTypes = async (req, res, next) => {
  try {
    const types = await Type.find();
    res.status(200).json(types);
  } catch (error) {
    res.status(400).json({
      message: "Aucun type trouvé",
      error: error.message,
    });
  }
};

exports.getTypeById = async (req, res, next) => {
  try {
    const { typeId } = req.params;
    const type = await Type.findById(typeId);
    res.status(200).json(type);
  } catch (error) {
    res.status(400).json({
      message: "Aucun type trouvé",
      error: error.message,
    });
  }
};

exports.updateType = async (req, res, next) => {
  try {
    const { typeId } = req.params;
    const { name, message,price,isRequired } = req.body;
    const type = await Type.findById(typeId);
    if (!type) {
      res.status(500).json({ message: "aucun Type trouvée" });
    }
    const updatedType = await Type.findByIdAndUpdate(typeId, {
      name,
      message,
      isRequired,
      price: price || type.price,
    });

    res.status(200).json({ message: "Type modifié avec succées" });
  } catch (error) {
    res.status(400).json({
      message: "some error occured",
      error: error.message,
    });
  }
};

exports.deleteType = async (req, res, next) => {
  try {
    const { typeId } = req.params;
    const type = await Type.findById(typeId);
    if (!type) {
      return res.status(404).json({ message: "Type not found" });
    }

    const ingredients = await Ingrediant.find({ type: typeId });

    await Product.updateMany(
      { ingrediants: { $in: ingredients.map((ingredient) => ingredient._id) } },
      {
        $pull: {
          ingrediants: { $in: ingredients.map((ingredient) => ingredient._id) },
        },
      }
    );

    for (const ingredient of ingredients) {
      if (ingredient.image) {
        const imagePath = path.join(__dirname, "..", ingredient.image);
        fs.unlinkSync(imagePath);
      }
    }
    await Type.findByIdAndDelete(typeId);
    await Ingrediant.deleteMany({ type: typeId });

    await Product.updateMany({ type: typeId }, { $pull: { type: typeId } });
    res.status(200).json({ message: "Type supprimer avec succées" });
  } catch (error) {
    res.status(400).json({
      message: "Aucun type trouvé",
      error: error.message,
    });
  }
};
