const Type = require("../models/type");
const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
require("dotenv").config();
const jwtSecret = process.env.JWT_SECRET;
app.use(express.json());

exports.createType = async (req, res, next) => {
  const { name,message,free ,quantity} = req.body;

  try {
    // Check if the type already exists
    const existingType = await Type.findOne({ name });
    if (existingType) {
      return res.status(400).json({ message: "Type existe déja" });
    }

    // Create a new type
    const newType = new Type({ name ,message,free ,quantity});
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
    const { name ,message,free, quantity} = req.body;
    const type = await Type.findByIdAndUpdate(typeId, { name,message,free,quantity });
    res.status(200).json({message:"Type modifié avec succées"});
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
    await Type.findByIdAndDelete(typeId);
    res.status(200).json({ message: "Type supprimer avec succées" });
  } catch (error) {
    res.status(400).json({
      message: "Aucun type trouvé",
      error: error.message,
    });
  }
};
