const Extra = require("../models/extra");
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

exports.addExtra = async (req, res, next) => {
  upload.single("image")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        message: "Le téléchargement de l'image a échoué",
        error: err.message,
      });
    }

    const { name, price,outOfStock,visible } = req.body;
    const userId = req.user.user._id;
    const image = `uploads\\${req.file?.filename}`|| ""; 
    try {
      const extra = await Extra.create({
        name,
        image,
        price,
        outOfStock,
        visible,
        createdBy: userId,
      });
      await extra.save();
      res.status(201).json({ extra, message: "extra créer avec succées" });
    } catch (error) {
      res.status(400).json({
        message: "Une erreur s'est produite",
        error: error.message,
      });
    }
  });
};

exports.getExtras = async (req, res, next) => {
  try {
    const extras = await Extra.find();
    res.status(200).json(extras);
  } catch (error) {
    res.status(400).json({
      message: "Aucune Extra trouvé",
      error: error.message,
    });
  }
};

exports.getExtraById = async (req, res, next) => {
  const { extraId } = req.params;
  try {
    const extra = await Extra.findById(extraId);
    res.status(200).json(extra);
  } catch (error) {
    res.status(400).json({
      message: "Aucune Extra trouvé",
      error: error.message,
    });
  }
};

exports.updateExtra = async (req, res) => {
  const extraId = req.params.extraId;
  upload.single("image")(req, res, async (err) => {
    const { name, price ,outOfStock,visible} = req.body;
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Probleme image" });
    }
    const extra = await Extra.findById(extraId);
    if (!extra) {
      res.status(500).json({ message: "aucun Extra trouvée" });
    }
    if (req.file) {
      const image = `uploads\\${req.file?.filename}`|| ""; 
      if (extra.image) {
        fs.unlinkSync(extra.image);
      }
      extra.image = image;
    }
    try {
      const updatedextra = await Extra.findByIdAndUpdate(extraId, {
        name: name || extra.name,
        price: price || extra.price,
        image: extra.image,
        outOfStock: outOfStock || extra.outOfStock,
        visible: visible || extra.visible,
      });

      res.status(200).json({ message: "Extra modifiéer avec succées" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
};

exports.deleteExtra = async (req, res, next) => {
  const { extraId } = req.params;
  try {
    const extra = await Extra.findById(extraId);
    if (!extra) {
      return res.status(404).json({
        message: "il n'y a pas de extra avec cet id",
      });
    }
    if (extra.image) {
      fs.unlink(extra.image, (err) => {
        if (err) {
          res.status(500).json({
            message: "Aucune extra image trouvé",
          });
        }
      });
    }
    await Extra.findByIdAndDelete(extra);
    res.status(200).json({
      message: "Extra supprimer avec succées",
    });
  } catch (error) {
    res.status(400).json({
      message: "Une erreur s'est produite",
      error: error.message,
    });
  }
};
