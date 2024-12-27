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
        message: "Le téléchargement de l'image a échoué",
        error: err.message,
      });
    }
    if (!req.file) {
      return res.status(400).json({
        message: "Ajouter une image",
        error: "Veuillez télécharger une image",
      });
    }

    const { name, price, outOfStock, visible } = req.body;
    const image = `uploads/${req.file?.filename}` || "";
    try {
      const drinks = await Drink.create({
        name,
        price,
        image,
        outOfStock,
        visible,
      });
      res.status(201).json({
        drinks,
        message: "Boissons créer avec succées",
      });
    } catch (error) {
      res.status(400).json({
        message: "Une erreur s'est produite",
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
      const imagePath = path.join(__dirname, "..", drinks.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
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
    const { name, price, outOfStock, visible } = req.body;
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Probleme image" });
    }
    const drink = await Drink.findById(drinkId);
    if (!drink) {
      res.status(500).json({ message: "aucun Boisson trouvée" });
    }
    if (req.file) {
      const image = `uploads\\${req.file?.filename}` || "";
      if (drink.image) {
        const imagePath = path.join(__dirname, "..", drink.image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
      drink.image = image;
    }
    try {
      const updatedDrink = await Drink.findByIdAndUpdate(drinkId, {
        name: name || drink.name,
        price: price || drink.price,
        image: drink.image,
        outOfStock: outOfStock || drink.outOfStock,
        visible: visible || drink.visible,
      });

      res.status(200).json({ message: "Boisson modifiéer avec succées" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
};
