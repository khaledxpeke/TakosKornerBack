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

    const { name, price,max } = req.body;
    const image = `uploads/${req.file?.filename}`|| ""; ;
    try {
      const drinks = await Drink.create({
        name,
        price,
        image,
        max,
      });
      res.status(201).json({
        drinks,message:"Boissons créer avec succées"
      });
    } catch (error) {
      res.status(400).json({
        message: "Some error occured",
        error: error.message,
      });
    }
  });
};

exports.getAllDrinks = async (req, res, next) => {
  try {

    const drinks = await Drink.find();
    res.status(200).json(drinks);
  } catch (error) {
    res.status(400).json({
      message: "Aucun Boissons trouvé",
      error: error.message,
    });
  }
};

exports.getDrinkById = async (req, res, next) => {
  try {
    const { drinkId } = req.params;
    const drink = await Drink.findById(drinkId);
    res.status(200).json({
        drink,
    });
  } catch (error) {
    res.status(400).json({
      message: "Aucun boisson trouvé",
      error: error.message,
    });
  }
};

exports.deleteDrink = async (req, res, next) => {
  try {
    const { drinkId } = req.params;
    const drinks = await Drink.findById(drinkId);
    if (drinks.image) {
      fs.unlink(drinks.image, (err) => {
        if (err) {
          res.status(500).json({
            message: "Aucun boisson image trouvé",
          });
        }
      });
    }
    await Drink.findByIdAndDelete(drinks);
    res.status(200).json({
      message: "Boisson supprimé avec succées",
    });
  } catch (error) {
    res.status(400).json({
      message: "Aucun boisson trouvé pour supprimer",
      error: error.message,
    });
  }
};
exports.updateDrink = async (req, res) => {
  const drinkId = req.params.drinkId;
  upload.single("image")(req, res, async (err) => {
    const { name,price,max } = req.body;
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Server error" });
    }
    const drink = await Drink.findById(drinkId);
    if (!drink) {
      res.status(500).json({ message: "aucun Boisson trouvée" });
    }
    if (req.file) {
      if (drink.image) {
        fs.unlinkSync(drink.image);
      }
      drink.image = req.file.path;
    }
    try {
      const updatedDrink = await Drink.findByIdAndUpdate(drinkId, {
        name: name || drink.name,
        price: price || drink.price,
        max: max || drink.max,
        image: drink.image, 
      });

      res
        .status(200)
        .json({ message: "Boisson modifiéer avec succées" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
};