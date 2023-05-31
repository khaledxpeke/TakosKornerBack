const Pack = require("../models/pack");
const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
require("dotenv").config();
const jwtSecret = process.env.JWT_SECRET;
app.use(express.json());
const multer = require("multer");
const multerStorage = require("../middleware/multerStorage");

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
      message: "No packs found",
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
      message: "No pack found",
      error: error.message,
    });
  }
};

exports.updatePack = async (req, res, next) => {
  const { name, image, price } = req.body;
  try {
    const pack = await Pack.findById(req.params.packId);
    if (!pack) {
      return res.status(404).json({
        message: "Pack not found",
      });
    }
    pack.name = name;
    pack.image = image;
    pack.price = price;
    await pack.save();
    res.status(200).json(pack);
  } catch (error) {
    res.status(400).json({
      message: "Some error occured",
      error: error.message,
    });
  }
};

exports.deletePack = async (req, res, next) => {
  const { packId } = req.params;
  try {
    const pack = await Pack.findByIdAndDelete(packId);
    if (!pack) {
      return res.status(404).json({
        message: "il n'y a pas de formule avec cet id",
      });
    }
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
