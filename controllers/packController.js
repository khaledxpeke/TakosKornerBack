const Pack = require("../models/pack");
const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
require("dotenv").config();
const jwtSecret = process.env.JWT_SECRET;
app.use(express.json());

exports.addPack = async (req, res, next) => {
  const { name, image, price ,currency } = req.body;
  const userId = req.user.id;
  try {
    const pack = await Pack.create({
      name,
      image,
      price,
      currency,
      createdBy: userId,
    });
    await pack.save();
    res.status(201).json(pack);
  } catch (error) {
    res.status(400).json({
      message: "Some error occured",
      error: error.message,
    });
  }
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
    const pack = await Pack.findById(packId);
    if (!pack) {
      return res.status(404).json({
        message: "Pack not found",
      });
    }
    await pack.remove();
    res.status(200).json({
      message: "Pack deleted",
    });
  } catch (error) {
    res.status(400).json({
      message: "Some error occured",
      error: error.message,
    });
  }
};
