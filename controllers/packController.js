const Pack = require("../models/pack");
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
exports.addPack = async (req, res, next) => {

  upload.single("image")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        message: "Image upload failed",
        error: err.message,
      });
    }

    const { name, price, currency } = req.body;
    const userId = req.user.id;
    const image = req.file?.path || "";
    try {
      const pack = await Pack.create({
        name,
        image,
        price,
        currency,
        createdBy: userId,
      });
      await pack.save();
      res.status(201).json({pack,message:"formule créer avec succées"});
    } catch (error) {
      res.status(400).json({
        message: "Some error occured",
        error: error.message,
      });
    }
  });
};

exports.getPacks = async (req, res, next) => {
  try {
    const packs = await Pack.find();
    res.status(200).json(packs);
  } catch (error) {
    res.status(400).json({
      message: "Aucune Formule trouvé",
      error: error.message,
    });
  }
};

exports.getPackById = async (req, res, next) => {
  const { packId } = req.params;
  try {
    const pack = await Pack.findById(packId);
    res.status(200).json(pack);
  } catch (error) {
    res.status(400).json({
      message: "Aucune Formule trouvé",
      error: error.message,
    });
  }
};

exports.updatePack = async (req, res) => {
  const packId = req.params.packId;
  upload.single("image")(req, res, async (err) => {
    const { name, price,currency } = req.body;
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Server error" });
    }
    const pack = await Pack.findById(packId);
    if (!pack) {
      res.status(500).json({ message: "aucun Formule trouvée" });
    }
    if (req.file) {
      if (pack.image) {
        fs.unlinkSync(pack.image);
      }
      pack.image = req.file.path;
    }
    try {
      const updatedpack = await Pack.findByIdAndUpdate(packId, {
        name: name || pack.name,
        price: price || pack.price,
        currency: currency || pack.currency,
        image: pack.image, 
      });

      res
        .status(200)
        .json({ message: "Formule modifiéer avec succées" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
};

exports.deletePack = async (req, res, next) => {
  const { packId } = req.params;
  try {
    const pack = await Pack.findById(packId);
    if (!pack) {
      return res.status(404).json({
        message: "il n'y a pas de formule avec cet id",
      });
    }
    if (pack.image) {
      fs.unlink(pack.image, (err) => {
        if (err) {
          res.status(500).json({
            message: "Aucune Formule image trouvé",
          });
        }
      });
    }
    await Pack.findByIdAndDelete(pack);
    res.status(200).json({
      message: "Formule supprimer avec succées",
    });
  } catch (error) {
    res.status(400).json({
      message: "Some error occured",
      error: error.message,
    });
  }
};
