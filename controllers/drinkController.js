const Drink = require("../models/drink");
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
exports.addDrink = async (req, res, next) => {
  upload.single("image")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        message: "Image upload failed",
        error: err.message,
      });
    }
    if (!req.file) {
      return res.status(400).json({
        message: "Ajouter une image",
        error: "Please upload an image",
      });
    }

    const { name, price,currency } = req.body;
    const image = req.file.path;
    try {
      const drinks = await Drink.create({
        name,
        price,
        image,
        currency,
      });
      res.status(201).json({
        drinks,message:"Drink créer avec succées"
      });
    } catch (error) {
      res.status(400).json({
        message: "Some error occured",
        error: error.message,
      });
    }
  });
};

exports.getAllDeserts = async (req, res, next) => {
  try {

    const deserts = await Desert.find();
    res.status(200).json(deserts);
  } catch (error) {
    res.status(400).json({
      message: "Aucun dessert trouvé",
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
      message: "Aucun dessert trouvé",
      error: error.message,
    });
  }
};

exports.deleteDesert = async (req, res, next) => {
  try {
    const { desertId } = req.params;
    const deserts = await Desert.findById(desertId);
    if (deserts.image) {
      fs.unlink(deserts.image, (err) => {
        if (err) {
          res.status(500).json({
            message: "Aucun dessert image trouvé",
          });
        }
      });
    }
    await Desert.findByIdAndDelete(deserts);
    res.status(200).json({
      message: "Dessert supprimé avec succées",
    });
  } catch (error) {
    res.status(400).json({
      message: "Aucun dessert trouvé pour supprimer",
      error: error.message,
    });
  }
};
exports.updateDesert = async (req, res) => {
  const desertId = req.params.desertId;
  upload.single("image")(req, res, async (err) => {
    const { name,price,currency } = req.body;
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Server error" });
    }
    const desert = await Desert.findById(desertId);
    if (!desert) {
      res.status(500).json({ message: "aucun Dessert trouvée" });
    }
    if (req.file) {
      if (desert.image) {
        fs.unlinkSync(desert.image);
      }
      desert.image = req.file.path;
    }
    try {
      const updatedDesert = await Desert.findByIdAndUpdate(desertId, {
        name: name || desert.name,
        price: price || desert.price,
        currency: currency || desert.currency,
        image: desert.image, 
      });

      res
        .status(200)
        .json({ message: "Dessert modifiéer avec succées" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
};