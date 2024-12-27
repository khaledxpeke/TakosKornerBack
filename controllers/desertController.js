const Desert = require("../models/desert");
const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
require("dotenv").config();
const jwtSecret = process.env.JWT_SECRET;
app.use(express.json());
const multer = require("multer");
const multerStorage = require("../middleware/multerStorage");
const fs = require("fs");
const path = require("path");

const upload = multer({ storage: multerStorage });
exports.addDesert = async (req, res, next) => {
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
      const deserts = await Desert.create({
        name,
        price,
        image,
        outOfStock,
        visible,
      });
      res.status(201).json({
        deserts,
        message: "Dessert créer avec succées",
      });
    } catch (error) {
      res.status(400).json({
        message: "Une erreur s'est produite",
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
      const imagePath = path.join(__dirname, "..", deserts.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
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
    const { name, price, outOfStock, visible } = req.body;
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Probleme image" });
    }
    const desert = await Desert.findById(desertId);
    if (!desert) {
      res.status(500).json({ message: "aucun Dessert trouvée" });
    }
    if (req.file) {
      const image = `uploads\\${req.file?.filename}` || "";
      if (desert.image) {
        const imagePath = path.join(__dirname, "..", desert.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
      }
      desert.image = image;
    }
    try {
      const updatedDesert = await Desert.findByIdAndUpdate(desertId, {
        name: name || desert.name,
        price: price || desert.price,
        image: desert.image,
        outOfStock: outOfStock || desert.outOfStock,
        visible: visible || desert.visible,
      });

      res.status(200).json({ message: "Dessert modifiéer avec succées" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
};
